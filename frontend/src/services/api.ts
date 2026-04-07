import type { Project, Notification } from '../types';

const API_BASE = '/api/v1';

async function request<T>(path: string, opts?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...opts?.headers },
    ...opts,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

// ─── Projects ────────────────────────────────────────────
export const projectApi = {
  list: (params?: { search?: string; sort?: string; archived?: string }) => {
    const qs = new URLSearchParams(params as Record<string, string>).toString();
    return request<Project[]>(`/projects${qs ? `?${qs}` : ''}`);
  },
  get: (id: string) => request<Project>(`/projects/${id}`),
  create: (name: string, client: string) =>
    request<{ id: string }>('/projects', { method: 'POST', body: JSON.stringify({ name, client }) }),
  update: (id: string, data: { name?: string; client?: string }) =>
    request(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request(`/projects/${id}`, { method: 'DELETE' }),
  archive: (id: string) =>
    request(`/projects/${id}/archive`, { method: 'POST' }),
};

// ─── Phases ──────────────────────────────────────────────
export const phaseApi = {
  get: (projectId: string, phaseId: number) =>
    request(`/projects/${projectId}/phases/${phaseId}`),
  setInput: (projectId: string, phaseId: number, input: Record<string, unknown>) =>
    request(`/projects/${projectId}/phases/${phaseId}/input`, {
      method: 'PUT', body: JSON.stringify(input),
    }),
  updateSystemPrompt: (projectId: string, phaseId: number, prompt: string) =>
    request(`/projects/${projectId}/phases/${phaseId}/system-prompt`, {
      method: 'PUT', body: JSON.stringify({ prompt }),
    }),
  resetSystemPrompt: (projectId: string, phaseId: number) =>
    request(`/projects/${projectId}/phases/${phaseId}/system-prompt/reset`, { method: 'POST' }),
  start: (projectId: string, phaseId: number) =>
    request<{ runId: string }>(`/projects/${projectId}/phases/${phaseId}/start`, { method: 'POST' }),
  retry: (projectId: string, phaseId: number) =>
    request<{ runId: string }>(`/projects/${projectId}/phases/${phaseId}/retry`, { method: 'POST' }),
  approve: (projectId: string, phaseId: number) =>
    request(`/projects/${projectId}/phases/${phaseId}/approve`, { method: 'POST' }),
  reject: (projectId: string, phaseId: number, feedback: string) =>
    request(`/projects/${projectId}/phases/${phaseId}/reject`, {
      method: 'POST', body: JSON.stringify({ feedback }),
    }),
  rejectApproved: (projectId: string, phaseId: number, feedback: string) =>
    request(`/projects/${projectId}/phases/${phaseId}/reject-approved`, {
      method: 'POST', body: JSON.stringify({ feedback }),
    }),
  updateOutput: (projectId: string, phaseId: number, output: Record<string, unknown>) =>
    request(`/projects/${projectId}/phases/${phaseId}/output`, {
      method: 'PUT', body: JSON.stringify(output),
    }),
  restoreVersion: (projectId: string, phaseId: number, versionId: string) =>
    request(`/projects/${projectId}/phases/${phaseId}/versions/${versionId}/restore`, { method: 'POST' }),
  exportJson: (projectId: string, phaseId: number) =>
    `${API_BASE}/projects/${projectId}/phases/${phaseId}/export/json`,
};

// ─── Files ───────────────────────────────────────────────
export const fileApi = {
  upload: async (projectId: string, phaseId: number, file: File) => {
    const form = new FormData();
    form.append('file', file);
    const res = await fetch(`${API_BASE}/projects/${projectId}/phases/${phaseId}/files`, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) throw new Error('Upload failed');
    return res.json();
  },
  list: (projectId: string, phaseId: number) =>
    request(`/projects/${projectId}/phases/${phaseId}/files`),
  download: (fileId: string) =>
    `${API_BASE}/files/${fileId}`,
  text: (fileId: string) =>
    request<{ text: string | null }>(`/files/${fileId}/text`),
};

// ─── Notifications ───────────────────────────────────────
export const notificationApi = {
  list: () => request<Notification[]>('/notifications'),
  markRead: (id: string) =>
    request(`/notifications/${id}/read`, { method: 'POST' }),
  markAllRead: () =>
    request('/notifications/read-all', { method: 'POST' }),
};
