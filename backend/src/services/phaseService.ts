import { eq, and, asc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { phaseStates, outputVersions, logEntries, projects } from '../db/schema.js';
import { PHASE_CONFIGS } from '@ai-portal/shared';
import { AppError } from '../middleware/errorHandler.js';
import type { PhaseState, OutputVersion, LogEntry } from '@ai-portal/shared';

/* ── Helpers ──────────────────────────────────────────── */

async function getPhaseStateRow(projectId: string, phaseId: number) {
  const [row] = await db.select().from(phaseStates)
    .where(and(eq(phaseStates.projectId, projectId), eq(phaseStates.phaseId, phaseId)))
    .limit(1);
  if (!row) throw new AppError(404, 'Phase not found');
  return row;
}

async function touchProject(projectId: string) {
  await db.update(projects).set({ updatedAt: new Date() }).where(eq(projects.id, projectId));
}

async function nextVersionNumber(phaseStateId: number): Promise<number> {
  const [last] = await db.select({ n: outputVersions.versionNumber })
    .from(outputVersions)
    .where(eq(outputVersions.phaseStateId, phaseStateId))
    .orderBy(asc(outputVersions.versionNumber))
    .limit(1);
  // Count all versions instead
  const all = await db.select({ n: outputVersions.versionNumber })
    .from(outputVersions)
    .where(eq(outputVersions.phaseStateId, phaseStateId));
  return all.length + 1;
}

/* ── Get phase with versions and logs ─────────────────── */

export async function getPhase(projectId: string, phaseId: number): Promise<PhaseState> {
  const row = await getPhaseStateRow(projectId, phaseId);

  const versions = await db.select().from(outputVersions)
    .where(eq(outputVersions.phaseStateId, row.id))
    .orderBy(asc(outputVersions.versionNumber));

  const logs = await db.select().from(logEntries)
    .where(eq(logEntries.phaseStateId, row.id))
    .orderBy(asc(logEntries.createdAt));

  return {
    phaseId: row.phaseId,
    status: row.status as PhaseState['status'],
    log: logs.map((l) => ({
      timestamp: l.createdAt.toISOString(),
      type: l.type as LogEntry['type'],
      message: l.message,
    })),
    output: row.output as Record<string, unknown> | null,
    versions: versions.map((v) => ({
      id: v.id,
      createdAt: v.createdAt.toISOString(),
      action: v.action as OutputVersion['action'],
      status: v.status as OutputVersion['status'],
      data: v.data as Record<string, unknown>,
      note: v.note ?? undefined,
    })),
    currentVersionId: row.currentVersionId,
    lastRunAt: row.lastRunAt?.toISOString() ?? null,
    input: row.input as Record<string, unknown> | null,
    systemPrompt: row.systemPrompt,
    systemPromptModified: row.systemPromptModified,
    rejectionFeedback: row.rejectionFeedback,
  };
}

/* ── Set input ────────────────────────────────────────── */

export async function setInput(projectId: string, phaseId: number, input: Record<string, unknown>) {
  const row = await getPhaseStateRow(projectId, phaseId);
  await db.update(phaseStates).set({ input }).where(eq(phaseStates.id, row.id));
  await touchProject(projectId);
}

/* ── System prompt ────────────────────────────────────── */

export async function updateSystemPrompt(projectId: string, phaseId: number, prompt: string) {
  const row = await getPhaseStateRow(projectId, phaseId);
  await db.update(phaseStates)
    .set({ systemPrompt: prompt, systemPromptModified: true })
    .where(eq(phaseStates.id, row.id));
}

export async function resetSystemPrompt(projectId: string, phaseId: number) {
  const row = await getPhaseStateRow(projectId, phaseId);
  const { DEFAULT_SYSTEM_PROMPTS } = await import('@ai-portal/shared');
  await db.update(phaseStates)
    .set({ systemPrompt: DEFAULT_SYSTEM_PROMPTS[phaseId] ?? '', systemPromptModified: false })
    .where(eq(phaseStates.id, row.id));
}

/* ── Start agent (creates running version, returns runId) */

export async function startAgent(projectId: string, phaseId: number): Promise<{ runId: string; phaseStateId: number }> {
  const row = await getPhaseStateRow(projectId, phaseId);

  if (row.status !== 'waiting' && row.status !== 'ready' && row.status !== 'rejected') {
    throw new AppError(400, `Cannot start agent in status '${row.status}'`);
  }

  const versionNum = await nextVersionNumber(row.id);

  // Create running version
  const [version] = await db.insert(outputVersions).values({
    phaseStateId: row.id,
    versionNumber: versionNum,
    action: 'generated',
    status: 'running',
    data: {},
  }).returning({ id: outputVersions.id });

  // Clear old logs and update phase state
  await db.delete(logEntries).where(eq(logEntries.phaseStateId, row.id));
  await db.update(phaseStates).set({
    status: 'running',
    currentVersionId: version.id,
    rejectionFeedback: null,
  }).where(eq(phaseStates.id, row.id));

  await touchProject(projectId);

  return { runId: version.id, phaseStateId: row.id };
}

/* ── Complete agent (called by worker) ────────────────── */

export async function completeAgent(
  phaseStateId: number,
  versionId: string,
  output: Record<string, unknown>,
) {
  const [row] = await db.select().from(phaseStates).where(eq(phaseStates.id, phaseStateId)).limit(1);
  if (!row) return;

  const phaseConfig = PHASE_CONFIGS.find((c) => c.id === row.phaseId);
  const isContinuous = phaseConfig?.type === 'continuous';

  // Update version data and status
  await db.update(outputVersions).set({
    data: output,
    status: isContinuous ? 'approved' : 'review',
  }).where(eq(outputVersions.id, versionId));

  // Update phase state
  if (isContinuous) {
    // Auto-approve continuous phases
    await db.update(phaseStates).set({
      status: 'ready',
      output,
      lastRunAt: new Date(),
    }).where(eq(phaseStates.id, phaseStateId));

    // Unlock dependents
    await unlockDependents(row.projectId, row.phaseId);
  } else {
    await db.update(phaseStates).set({
      status: 'review',
      output,
    }).where(eq(phaseStates.id, phaseStateId));
  }

  await touchProject(row.projectId);
}

/* ── Fail agent (called by worker on error) ───────────── */

export async function failAgent(phaseStateId: number, versionId: string, error: string) {
  const [row] = await db.select().from(phaseStates).where(eq(phaseStates.id, phaseStateId)).limit(1);
  if (!row) return;

  await db.update(outputVersions).set({ status: 'rejected' }).where(eq(outputVersions.id, versionId));
  await db.update(phaseStates).set({ status: 'error' }).where(eq(phaseStates.id, phaseStateId));
  await touchProject(row.projectId);
}

/* ── Approve phase ────────────────────────────────────── */

export async function approvePhase(projectId: string, phaseId: number) {
  const row = await getPhaseStateRow(projectId, phaseId);

  if (row.status !== 'review' && row.status !== 'waiting' && row.status !== 'rejected') {
    throw new AppError(400, `Cannot approve phase in status '${row.status}'`);
  }

  const phaseConfig = PHASE_CONFIGS.find((c) => c.id === phaseId);
  const isContinuous = phaseConfig?.type === 'continuous';
  const newStatus = isContinuous ? 'ready' : 'approved';

  // Update version status
  if (row.currentVersionId) {
    await db.update(outputVersions)
      .set({ status: 'approved' })
      .where(eq(outputVersions.id, row.currentVersionId));
  }

  // Update phase
  await db.update(phaseStates).set({
    status: newStatus,
    lastRunAt: new Date(),
  }).where(eq(phaseStates.id, row.id));

  // Unlock dependents
  await unlockDependents(projectId, phaseId);
  await touchProject(projectId);
}

/* ── Unlock dependent phases ──────────────────────────── */

async function unlockDependents(projectId: string, approvedPhaseId: number) {
  // Load all phases for this project
  const allPhases = await db.select().from(phaseStates)
    .where(eq(phaseStates.projectId, projectId));

  const phaseMap = new Map(allPhases.map((p) => [p.phaseId, p]));

  for (const cfg of PHASE_CONFIGS) {
    if (!cfg.dependencies.includes(approvedPhaseId)) continue;
    const depPhase = phaseMap.get(cfg.id);
    if (!depPhase || depPhase.status !== 'locked') continue;

    // Check if all dependencies are met
    const allDepsMet = cfg.dependencies.every((depId) => {
      const dep = phaseMap.get(depId);
      return dep && (dep.status === 'approved' || dep.status === 'ready');
    });

    if (allDepsMet) {
      await db.update(phaseStates)
        .set({ status: 'waiting' })
        .where(eq(phaseStates.id, depPhase.id));
    }
  }
}

/* ── Reject phase (from review) ───────────────────────── */

export async function rejectPhase(projectId: string, phaseId: number, feedback: string) {
  const row = await getPhaseStateRow(projectId, phaseId);

  if (row.status !== 'review') {
    throw new AppError(400, `Cannot reject phase in status '${row.status}'`);
  }

  // Update version status
  if (row.currentVersionId) {
    await db.update(outputVersions)
      .set({ status: 'rejected', note: feedback || undefined })
      .where(eq(outputVersions.id, row.currentVersionId));
  }

  // Clear logs, reset output
  await db.delete(logEntries).where(eq(logEntries.phaseStateId, row.id));

  await db.update(phaseStates).set({
    status: 'rejected',
    output: null,
    rejectionFeedback: feedback,
  }).where(eq(phaseStates.id, row.id));

  await touchProject(projectId);
}

/* ── Reject approved phase (+ BFS cascade) ────────────── */

export async function rejectApprovedPhase(projectId: string, phaseId: number, feedback: string) {
  const row = await getPhaseStateRow(projectId, phaseId);

  if (row.status !== 'approved' && row.status !== 'ready') {
    throw new AppError(400, `Cannot reject-approved phase in status '${row.status}'`);
  }

  // Update current version
  if (row.currentVersionId) {
    await db.update(outputVersions)
      .set({ status: 'rejected', note: feedback || undefined })
      .where(eq(outputVersions.id, row.currentVersionId));
  }

  // Clear logs, reset phase
  await db.delete(logEntries).where(eq(logEntries.phaseStateId, row.id));

  await db.update(phaseStates).set({
    status: 'rejected',
    output: null,
    rejectionFeedback: feedback,
  }).where(eq(phaseStates.id, row.id));

  // BFS cascade lock all downstream phases
  const allPhases = await db.select().from(phaseStates)
    .where(eq(phaseStates.projectId, projectId));
  const phaseMap = new Map(allPhases.map((p) => [p.phaseId, p]));

  const queue = [phaseId];
  const visited = new Set<number>([phaseId]);

  while (queue.length > 0) {
    const current = queue.shift()!;
    for (const cfg of PHASE_CONFIGS) {
      if (cfg.dependencies.includes(current) && !visited.has(cfg.id)) {
        visited.add(cfg.id);
        queue.push(cfg.id);

        const dep = phaseMap.get(cfg.id);
        if (dep) {
          await db.update(phaseStates)
            .set({ status: 'locked' })
            .where(eq(phaseStates.id, dep.id));
        }
      }
    }
  }

  await touchProject(projectId);
}

/* ── Restore version ──────────────────────────────────── */

export async function restoreVersion(projectId: string, phaseId: number, versionId: string) {
  const row = await getPhaseStateRow(projectId, phaseId);

  const [version] = await db.select().from(outputVersions)
    .where(eq(outputVersions.id, versionId))
    .limit(1);

  if (!version || version.phaseStateId !== row.id) {
    throw new AppError(404, 'Version not found');
  }

  // Prevent duplicate restore
  if (row.output !== null && JSON.stringify(row.output) === JSON.stringify(version.data)) {
    throw new AppError(400, 'Output already matches this version');
  }

  const versionNum = await nextVersionNumber(row.id);

  const [restored] = await db.insert(outputVersions).values({
    phaseStateId: row.id,
    versionNumber: versionNum,
    action: 'restored',
    status: 'review',
    data: version.data ?? {},
    note: `Obnoveno z v${version.versionNumber}`,
  }).returning({ id: outputVersions.id });

  await db.update(phaseStates).set({
    status: 'review',
    output: version.data,
    currentVersionId: restored.id,
    rejectionFeedback: null,
  }).where(eq(phaseStates.id, row.id));

  await touchProject(projectId);
}

/* ── Update output (edit — creates new version) ───────── */

export async function updateOutput(projectId: string, phaseId: number, output: Record<string, unknown>) {
  const row = await getPhaseStateRow(projectId, phaseId);

  const versionNum = await nextVersionNumber(row.id);

  const [version] = await db.insert(outputVersions).values({
    phaseStateId: row.id,
    versionNumber: versionNum,
    action: 'edited',
    status: 'review',
    data: output,
  }).returning({ id: outputVersions.id });

  await db.update(phaseStates).set({
    output,
    currentVersionId: version.id,
  }).where(eq(phaseStates.id, row.id));

  await touchProject(projectId);
}

/* ── Retry agent ──────────────────────────────────────── */

export async function retryAgent(projectId: string, phaseId: number): Promise<{ runId: string; phaseStateId: number }> {
  const row = await getPhaseStateRow(projectId, phaseId);

  if (row.status !== 'error') {
    throw new AppError(400, `Cannot retry phase in status '${row.status}'`);
  }

  // Reset to waiting, then start
  await db.update(phaseStates).set({ status: 'waiting' }).where(eq(phaseStates.id, row.id));
  await db.delete(logEntries).where(eq(logEntries.phaseStateId, row.id));

  return startAgent(projectId, phaseId);
}

/* ── Add log entry (called by worker) ─────────────────── */

export async function addLogEntry(
  phaseStateId: number,
  agentRunId: string | null,
  type: 'ok' | 'info' | 'warn' | 'error',
  message: string,
) {
  await db.insert(logEntries).values({
    phaseStateId,
    agentRunId,
    type,
    message,
  });
}
