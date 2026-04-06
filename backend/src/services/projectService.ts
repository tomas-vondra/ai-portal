import { eq, and, or, ilike, desc, asc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { projects, phaseStates, outputVersions, logEntries } from '../db/schema.js';
import { PHASE_CONFIGS, DEFAULT_SYSTEM_PROMPTS } from '@ai-portal/shared';
import { AppError } from '../middleware/errorHandler.js';
import type { Project, PhaseState, OutputVersion, LogEntry } from '@ai-portal/shared';

export async function listProjects(opts: {
  search?: string;
  sort?: 'date' | 'phase';
  archived?: boolean;
}) {
  let query = db.select().from(projects).$dynamic();

  const conditions = [];
  if (opts.archived !== undefined) {
    conditions.push(eq(projects.archived, opts.archived));
  }
  if (opts.search) {
    conditions.push(
      or(
        ilike(projects.name, `%${opts.search}%`),
        ilike(projects.client, `%${opts.search}%`),
      )!,
    );
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }

  if (opts.sort === 'date' || !opts.sort) {
    query = query.orderBy(desc(projects.updatedAt));
  } else {
    query = query.orderBy(asc(projects.createdAt));
  }

  return query;
}

export async function getProjectById(projectId: string): Promise<Project> {
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!project) throw new AppError(404, 'Project not found');

  const phases = await db.select().from(phaseStates).where(eq(phaseStates.projectId, projectId));
  const phaseIds = phases.map((p) => p.id);

  // Load versions and logs for all phases
  const versions = phaseIds.length > 0
    ? await db.select().from(outputVersions)
        .where(or(...phaseIds.map((id) => eq(outputVersions.phaseStateId, id)))!)
        .orderBy(asc(outputVersions.versionNumber))
    : [];

  const logs = phaseIds.length > 0
    ? await db.select().from(logEntries)
        .where(or(...phaseIds.map((id) => eq(logEntries.phaseStateId, id)))!)
        .orderBy(asc(logEntries.createdAt))
    : [];

  // Group by phase
  const versionsByPhase = new Map<number, OutputVersion[]>();
  const logsByPhase = new Map<number, LogEntry[]>();

  for (const v of versions) {
    const list = versionsByPhase.get(v.phaseStateId) ?? [];
    list.push({
      id: v.id,
      createdAt: v.createdAt.toISOString(),
      action: v.action as OutputVersion['action'],
      status: v.status as OutputVersion['status'],
      data: v.data as Record<string, unknown>,
      note: v.note ?? undefined,
    });
    versionsByPhase.set(v.phaseStateId, list);
  }

  for (const l of logs) {
    const list = logsByPhase.get(l.phaseStateId) ?? [];
    list.push({
      timestamp: l.createdAt.toISOString(),
      type: l.type as LogEntry['type'],
      message: l.message,
    });
    logsByPhase.set(l.phaseStateId, list);
  }

  const phasesMap: Record<number, PhaseState> = {};
  for (const p of phases) {
    phasesMap[p.phaseId] = {
      phaseId: p.phaseId,
      status: p.status as PhaseState['status'],
      log: logsByPhase.get(p.id) ?? [],
      output: p.output as Record<string, unknown> | null,
      versions: versionsByPhase.get(p.id) ?? [],
      currentVersionId: p.currentVersionId,
      lastRunAt: p.lastRunAt?.toISOString() ?? null,
      input: p.input as Record<string, unknown> | null,
      systemPrompt: p.systemPrompt,
      systemPromptModified: p.systemPromptModified,
      rejectionFeedback: p.rejectionFeedback,
    };
  }

  return {
    id: project.id,
    name: project.name,
    client: project.client,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    archived: project.archived,
    phases: phasesMap,
  };
}

export async function createProject(name: string, client: string, createdBy: string): Promise<string> {
  const [project] = await db.insert(projects).values({
    name,
    client,
    createdBy,
  }).returning({ id: projects.id });

  // Initialize all 13 phases
  const phaseValues = PHASE_CONFIGS.map((cfg) => ({
    projectId: project.id,
    phaseId: cfg.id,
    status: cfg.dependencies.length === 0 ? 'waiting' as const : 'locked' as const,
    systemPrompt: DEFAULT_SYSTEM_PROMPTS[cfg.id] ?? '',
    systemPromptModified: false,
  }));

  await db.insert(phaseStates).values(phaseValues);

  return project.id;
}

export async function updateProject(projectId: string, data: { name?: string; client?: string }) {
  const [updated] = await db.update(projects)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(projects.id, projectId))
    .returning();

  if (!updated) throw new AppError(404, 'Project not found');
  return updated;
}

export async function deleteProject(projectId: string) {
  const [deleted] = await db.delete(projects).where(eq(projects.id, projectId)).returning({ id: projects.id });
  if (!deleted) throw new AppError(404, 'Project not found');
}

export async function toggleArchive(projectId: string) {
  const [project] = await db.select({ archived: projects.archived }).from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!project) throw new AppError(404, 'Project not found');

  const [updated] = await db.update(projects)
    .set({ archived: !project.archived, updatedAt: new Date() })
    .where(eq(projects.id, projectId))
    .returning();

  return updated;
}
