import { create } from 'zustand';
import type { Project, PhaseStatus, LogEntry, OutputVersion, VersionStatus } from '../types';
import { mockProjects } from '../data/mockProjects';
import { mockOutputs, mockLogs, defaultSystemPrompts } from '../data/mockPhaseOutputs';
import { generateId } from '../utils/formatters';
import { PHASE_CONFIGS } from '../utils/phaseConfig';

/* ── helpers ─────────────────────────────────────────────── */

/** Immutably update a single version inside a versions array */
function patchVersion(
  versions: OutputVersion[],
  versionId: string | null,
  patch: Partial<OutputVersion>,
): OutputVersion[] {
  if (!versionId) return versions;
  return versions.map((v) => (v.id === versionId ? { ...v, ...patch } : v));
}

/* ── store interface ─────────────────────────────────────── */

interface ProjectStore {
  projects: Project[];
  getProject: (id: string) => Project | undefined;
  createProject: (name: string, client: string) => string;
  deleteProject: (id: string) => void;
  archiveProject: (id: string) => void;

  // Phase operations
  setPhaseStatus: (projectId: string, phaseId: number, status: PhaseStatus) => void;
  addLogEntry: (projectId: string, phaseId: number, entry: LogEntry) => void;
  setPhaseOutput: (projectId: string, phaseId: number, output: Record<string, unknown>) => void;
  approvePhase: (projectId: string, phaseId: number) => void;
  rejectPhase: (projectId: string, phaseId: number, feedback: string) => void;
  startAgent: (projectId: string, phaseId: number) => void;
  retryAgent: (projectId: string, phaseId: number) => void;
  setPhaseInput: (projectId: string, phaseId: number, input: Record<string, unknown>) => void;

  // System prompt
  updateSystemPrompt: (projectId: string, phaseId: number, prompt: string) => void;
  resetSystemPrompt: (projectId: string, phaseId: number) => void;

  // Version history
  restoreVersion: (projectId: string, phaseId: number, versionId: string) => void;

  // Approved phase rejection (cascades to dependents)
  rejectApprovedPhase: (projectId: string, phaseId: number, feedback: string) => void;

  // Output editing
  updateOutput: (projectId: string, phaseId: number, output: Record<string, unknown>) => void;
}

/* ── store implementation ────────────────────────────────── */

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: mockProjects,

  getProject: (id) => get().projects.find((p) => p.id === id),

  createProject: (name, client) => {
    const id = `proj-${generateId()}`;
    const phases: Record<number, any> = {};
    for (const cfg of PHASE_CONFIGS) {
      phases[cfg.id] = {
        phaseId: cfg.id,
        status: cfg.dependencies.length === 0 ? 'waiting' : 'locked',
        log: [],
        output: null,
        versions: [],
        currentVersionId: null,
        lastRunAt: null,
        input: null,
        systemPrompt: defaultSystemPrompts[cfg.id] ?? '',
        systemPromptModified: false,
        rejectionFeedback: null,
      };
    }
    const now = new Date().toISOString();
    const project: Project = { id, name, client, createdAt: now, updatedAt: now, archived: false, phases };
    set((s) => ({ projects: [...s.projects, project] }));
    return id;
  },

  deleteProject: (id) => {
    set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
  },

  archiveProject: (id) => {
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === id ? { ...p, archived: !p.archived, updatedAt: new Date().toISOString() } : p,
      ),
    }));
  },

  setPhaseStatus: (projectId, phaseId, status) => {
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              updatedAt: new Date().toISOString(),
              phases: { ...p.phases, [phaseId]: { ...p.phases[phaseId], status } },
            }
          : p,
      ),
    }));
  },

  addLogEntry: (projectId, phaseId, entry) => {
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              phases: {
                ...p.phases,
                [phaseId]: { ...p.phases[phaseId], log: [...p.phases[phaseId].log, entry] },
              },
            }
          : p,
      ),
    }));
  },

  /* ── startAgent: create a 'running' version entry ──────── */
  startAgent: (projectId, phaseId) => {
    const versionId = generateId();

    // Create version with status 'running' + set phase status
    set((s) => ({
      projects: s.projects.map((p) => {
        if (p.id !== projectId) return p;
        const phase = p.phases[phaseId];
        const version: OutputVersion = {
          id: versionId,
          createdAt: new Date().toISOString(),
          action: 'generated',
          status: 'running',
          data: {},
        };
        return {
          ...p,
          updatedAt: new Date().toISOString(),
          phases: {
            ...p.phases,
            [phaseId]: {
              ...phase,
              status: 'running' as PhaseStatus,
              log: [],
              versions: [...phase.versions, version],
              currentVersionId: versionId,
              rejectionFeedback: null,
            },
          },
        };
      }),
    }));

    // Simulate agent running
    const store = get();
    const logs = mockLogs[phaseId] ?? [
      { timestamp: new Date().toISOString(), type: 'info' as const, message: 'Agent spuštěn...' },
      { timestamp: new Date().toISOString(), type: 'ok' as const, message: 'Zpracovávám vstup...' },
      { timestamp: new Date().toISOString(), type: 'ok' as const, message: 'Generuji výstup...' },
      { timestamp: new Date().toISOString(), type: 'ok' as const, message: 'Dokončeno.' },
    ];

    logs.forEach((log, i) => {
      setTimeout(() => {
        get().addLogEntry(projectId, phaseId, { ...log, timestamp: new Date().toISOString() });

        // On last log entry, fill in data and move to review (or auto-approve for continuous)
        if (i === logs.length - 1) {
          setTimeout(() => {
            const output = mockOutputs[phaseId] ?? { result: 'Zpracování dokončeno.' };
            get().setPhaseOutput(projectId, phaseId, output);
            const phaseConfig = PHASE_CONFIGS.find((c) => c.id === phaseId);
            if (phaseConfig?.type === 'continuous') {
              get().approvePhase(projectId, phaseId);
            } else {
              get().setPhaseStatus(projectId, phaseId, 'review');
            }
          }, 500);
        }
      }, (i + 1) * 800);
    });
  },

  /* ── setPhaseOutput: update running version's data ─────── */
  setPhaseOutput: (projectId, phaseId, output) => {
    set((s) => ({
      projects: s.projects.map((p) => {
        if (p.id !== projectId) return p;
        const phase = p.phases[phaseId];

        // If current version is 'running', update it in-place
        const currentVer = phase.versions.find((v) => v.id === phase.currentVersionId);
        if (currentVer && currentVer.status === 'running') {
          return {
            ...p,
            updatedAt: new Date().toISOString(),
            phases: {
              ...p.phases,
              [phaseId]: {
                ...phase,
                output,
                versions: patchVersion(phase.versions, phase.currentVersionId, {
                  data: output,
                  status: 'review',
                }),
              },
            },
          };
        }

        // Fallback: create new version (e.g. called without prior startAgent)
        const versionId = generateId();
        const version: OutputVersion = {
          id: versionId,
          createdAt: new Date().toISOString(),
          action: 'generated',
          status: 'review',
          data: output,
        };
        return {
          ...p,
          updatedAt: new Date().toISOString(),
          phases: {
            ...p.phases,
            [phaseId]: {
              ...phase,
              output,
              versions: [...phase.versions, version],
              currentVersionId: versionId,
            },
          },
        };
      }),
    }));
  },

  /* ── approvePhase: update current version status ───────── */
  approvePhase: (projectId, phaseId) => {
    set((s) => {
      const project = s.projects.find((p) => p.id === projectId);
      if (!project) return s;

      const phaseConfig = PHASE_CONFIGS.find((c) => c.id === phaseId);
      const isContinuous = phaseConfig?.type === 'continuous';
      const newStatus: PhaseStatus = isContinuous ? 'ready' : 'approved';
      const phase = project.phases[phaseId];

      const updatedPhases = {
        ...project.phases,
        [phaseId]: {
          ...phase,
          status: newStatus,
          lastRunAt: new Date().toISOString(),
          versions: patchVersion(phase.versions, phase.currentVersionId, {
            status: 'approved' as VersionStatus,
          }),
        },
      };

      // Unlock dependent phases
      for (const cfg of PHASE_CONFIGS) {
        if (cfg.dependencies.includes(phaseId) && updatedPhases[cfg.id].status === 'locked') {
          const allDepsMet = cfg.dependencies.every((depId) => {
            const depStatus = updatedPhases[depId].status;
            return depStatus === 'approved' || depStatus === 'ready';
          });
          if (allDepsMet) {
            updatedPhases[cfg.id] = { ...updatedPhases[cfg.id], status: 'waiting' };
          }
        }
      }

      return {
        projects: s.projects.map((p) =>
          p.id === projectId
            ? { ...p, updatedAt: new Date().toISOString(), phases: updatedPhases }
            : p,
        ),
      };
    });
  },

  /* ── rejectPhase: update current version status to rejected ── */
  rejectPhase: (projectId, phaseId, feedback) => {
    set((s) => ({
      projects: s.projects.map((p) => {
        if (p.id !== projectId) return p;
        const phase = p.phases[phaseId];

        return {
          ...p,
          updatedAt: new Date().toISOString(),
          phases: {
            ...p.phases,
            [phaseId]: {
              ...phase,
              status: 'rejected' as PhaseStatus,
              output: null,
              log: [],
              versions: patchVersion(phase.versions, phase.currentVersionId, {
                status: 'rejected' as VersionStatus,
                note: feedback || undefined,
              }),
              // currentVersionId stays — points to the rejected version
              rejectionFeedback: feedback,
            },
          },
        };
      }),
    }));
  },

  retryAgent: (projectId, phaseId) => {
    // Clear error state and restart
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              phases: {
                ...p.phases,
                [phaseId]: { ...p.phases[phaseId], log: [], status: 'waiting' },
              },
            }
          : p,
      ),
    }));
    setTimeout(() => get().startAgent(projectId, phaseId), 300);
  },

  setPhaseInput: (projectId, phaseId, input) => {
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              phases: {
                ...p.phases,
                [phaseId]: { ...p.phases[phaseId], input },
              },
            }
          : p,
      ),
    }));
  },

  updateSystemPrompt: (projectId, phaseId, prompt) => {
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              phases: {
                ...p.phases,
                [phaseId]: {
                  ...p.phases[phaseId],
                  systemPrompt: prompt,
                  systemPromptModified: true,
                },
              },
            }
          : p,
      ),
    }));
  },

  resetSystemPrompt: (projectId, phaseId) => {
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              phases: {
                ...p.phases,
                [phaseId]: {
                  ...p.phases[phaseId],
                  systemPrompt: defaultSystemPrompts[phaseId] ?? '',
                  systemPromptModified: false,
                },
              },
            }
          : p,
      ),
    }));
  },

  /* ── restoreVersion: create new version from old data ──── */
  restoreVersion: (projectId, phaseId, versionId) => {
    set((s) => ({
      projects: s.projects.map((p) => {
        if (p.id !== projectId) return p;
        const phase = p.phases[phaseId];

        const version = phase.versions.find((v) => v.id === versionId);
        if (!version) return p;

        // Prevent duplicate restore — if current output already matches the source data
        if (phase.output !== null && JSON.stringify(phase.output) === JSON.stringify(version.data)) return p;

        const sourceNum = phase.versions.indexOf(version) + 1;

        const restoredVersion: OutputVersion = {
          id: generateId(),
          createdAt: new Date().toISOString(),
          action: 'restored',
          status: 'review',
          data: version.data,
          note: `Obnoveno z v${sourceNum}`,
        };

        return {
          ...p,
          updatedAt: new Date().toISOString(),
          phases: {
            ...p.phases,
            [phaseId]: {
              ...phase,
              status: 'review' as PhaseStatus,
              output: version.data,
              versions: [...phase.versions, restoredVersion],
              currentVersionId: restoredVersion.id,
              rejectionFeedback: null,
            },
          },
        };
      }),
    }));
  },

  /* ── rejectApprovedPhase: update version + cascade lock ── */
  rejectApprovedPhase: (projectId, phaseId, feedback) => {
    set((s) => {
      const project = s.projects.find((p) => p.id === projectId);
      if (!project) return s;

      const updatedPhases = { ...project.phases };
      const phase = updatedPhases[phaseId];

      // Update current version status to rejected (same version, just status change)
      updatedPhases[phaseId] = {
        ...phase,
        status: 'rejected' as PhaseStatus,
        output: null,
        log: [],
        versions: patchVersion(phase.versions, phase.currentVersionId, {
          status: 'rejected' as VersionStatus,
          note: feedback || undefined,
        }),
        rejectionFeedback: feedback,
      };

      // BFS to lock all downstream dependents
      const queue = [phaseId];
      const visited = new Set<number>([phaseId]);
      while (queue.length > 0) {
        const current = queue.shift()!;
        for (const cfg of PHASE_CONFIGS) {
          if (cfg.dependencies.includes(current) && !visited.has(cfg.id)) {
            visited.add(cfg.id);
            queue.push(cfg.id);
            updatedPhases[cfg.id] = {
              ...updatedPhases[cfg.id],
              status: 'locked' as PhaseStatus,
            };
          }
        }
      }

      return {
        projects: s.projects.map((p) =>
          p.id === projectId
            ? { ...p, updatedAt: new Date().toISOString(), phases: updatedPhases }
            : p,
        ),
      };
    });
  },

  /* ── updateOutput: create new 'edited' version ─────────── */
  updateOutput: (projectId, phaseId, output) => {
    const versionId = generateId();
    set((s) => ({
      projects: s.projects.map((p) => {
        if (p.id !== projectId) return p;
        const phase = p.phases[phaseId];
        const version: OutputVersion = {
          id: versionId,
          createdAt: new Date().toISOString(),
          action: 'edited',
          status: 'review',
          data: output,
        };
        return {
          ...p,
          updatedAt: new Date().toISOString(),
          phases: {
            ...p.phases,
            [phaseId]: {
              ...phase,
              output,
              versions: [...phase.versions, version],
              currentVersionId: versionId,
            },
          },
        };
      }),
    }));
  },
}));
