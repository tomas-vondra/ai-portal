import { create } from 'zustand';
import type { Project, LogEntry } from '../types';
import { projectApi, phaseApi } from '../services/api';
import { useToastStore } from './toastStore';

interface ProjectStore {
  projects: Project[];
  isLoading: boolean;
  error: string | null;

  getProject: (id: string) => Project | undefined;
  fetchProjects: () => Promise<void>;
  refreshProject: (id: string) => Promise<void>;
  createProject: (name: string, client: string) => Promise<string>;
  deleteProject: (id: string) => Promise<void>;
  archiveProject: (id: string) => Promise<void>;

  // Phase operations
  startAgent: (projectId: string, phaseId: number) => Promise<{ runId: string }>;
  retryAgent: (projectId: string, phaseId: number) => Promise<{ runId: string }>;
  approvePhase: (projectId: string, phaseId: number) => Promise<void>;
  rejectPhase: (projectId: string, phaseId: number, feedback: string) => Promise<void>;
  rejectApprovedPhase: (projectId: string, phaseId: number, feedback: string) => Promise<void>;
  updateOutput: (projectId: string, phaseId: number, output: Record<string, unknown>) => Promise<void>;
  restoreVersion: (projectId: string, phaseId: number, versionId: string) => Promise<void>;
  setPhaseInput: (projectId: string, phaseId: number, input: Record<string, unknown>) => Promise<void>;
  updateSystemPrompt: (projectId: string, phaseId: number, prompt: string) => Promise<void>;
  resetSystemPrompt: (projectId: string, phaseId: number) => Promise<void>;

  // Local-only actions for SSE streaming
  addLogEntry: (projectId: string, phaseId: number, entry: LogEntry) => void;
  setPhaseRunning: (projectId: string, phaseId: number) => void;
}

const toast = () => useToastStore.getState();

export const useProjectStore = create<ProjectStore>((set, get) => ({
  projects: [],
  isLoading: false,
  error: null,

  getProject: (id) => get().projects.find((p) => p.id === id),

  fetchProjects: async () => {
    set({ isLoading: true, error: null });
    try {
      const projects = await projectApi.list() as Project[];
      set({ projects, isLoading: false });
    } catch (e) {
      const msg = (e as Error).message;
      set({ error: msg, isLoading: false });
      toast().addToast('error', `Nepodařilo se načíst projekty: ${msg}`);
    }
  },

  refreshProject: async (id) => {
    try {
      const project = await projectApi.get(id) as Project;
      set((s) => ({
        projects: s.projects.some((p) => p.id === id)
          ? s.projects.map((p) => (p.id === id ? project : p))
          : [...s.projects, project],
      }));
    } catch (e) {
      toast().addToast('error', (e as Error).message);
    }
  },

  createProject: async (name, client) => {
    const { id } = await projectApi.create(name, client);
    await get().refreshProject(id);
    return id;
  },

  deleteProject: async (id) => {
    try {
      await projectApi.delete(id);
      set((s) => ({ projects: s.projects.filter((p) => p.id !== id) }));
    } catch (e) {
      toast().addToast('error', (e as Error).message);
      throw e;
    }
  },

  archiveProject: async (id) => {
    try {
      await projectApi.archive(id);
      await get().refreshProject(id);
    } catch (e) {
      toast().addToast('error', (e as Error).message);
      throw e;
    }
  },

  startAgent: async (projectId, phaseId) => {
    const result = await phaseApi.start(projectId, phaseId);
    // Optimistic: set phase to running locally
    get().setPhaseRunning(projectId, phaseId);
    return result;
  },

  retryAgent: async (projectId, phaseId) => {
    const result = await phaseApi.retry(projectId, phaseId);
    get().setPhaseRunning(projectId, phaseId);
    return result;
  },

  approvePhase: async (projectId, phaseId) => {
    await phaseApi.approve(projectId, phaseId);
    await get().refreshProject(projectId);
  },

  rejectPhase: async (projectId, phaseId, feedback) => {
    await phaseApi.reject(projectId, phaseId, feedback);
    await get().refreshProject(projectId);
  },

  rejectApprovedPhase: async (projectId, phaseId, feedback) => {
    await phaseApi.rejectApproved(projectId, phaseId, feedback);
    await get().refreshProject(projectId);
  },

  updateOutput: async (projectId, phaseId, output) => {
    await phaseApi.updateOutput(projectId, phaseId, output);
    await get().refreshProject(projectId);
  },

  restoreVersion: async (projectId, phaseId, versionId) => {
    await phaseApi.restoreVersion(projectId, phaseId, versionId);
    await get().refreshProject(projectId);
  },

  setPhaseInput: async (projectId, phaseId, input) => {
    await phaseApi.setInput(projectId, phaseId, input);
  },

  updateSystemPrompt: async (projectId, phaseId, prompt) => {
    await phaseApi.updateSystemPrompt(projectId, phaseId, prompt);
    await get().refreshProject(projectId);
  },

  resetSystemPrompt: async (projectId, phaseId) => {
    await phaseApi.resetSystemPrompt(projectId, phaseId);
    await get().refreshProject(projectId);
  },

  // Local-only: append log entry from SSE stream
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

  // Local-only: optimistic running state
  setPhaseRunning: (projectId, phaseId) => {
    set((s) => ({
      projects: s.projects.map((p) =>
        p.id === projectId
          ? {
              ...p,
              phases: {
                ...p.phases,
                [phaseId]: { ...p.phases[phaseId], status: 'running' as const, log: [] },
              },
            }
          : p,
      ),
    }));
  },
}));
