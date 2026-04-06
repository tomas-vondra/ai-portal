export interface AgentContext {
  projectId: string;
  phaseId: number;
  phaseStateId: number;
  versionId: string;
  publishLog: (type: 'ok' | 'info' | 'warn' | 'error', message: string) => Promise<void>;
}

export type AgentFn = (ctx: AgentContext) => Promise<Record<string, unknown>>;
