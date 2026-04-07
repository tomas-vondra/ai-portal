export type PhaseType = 'single' | 'continuous';

export type PhaseStatus =
  | 'locked'
  | 'waiting'
  | 'running'
  | 'review'
  | 'approved'
  | 'error'
  | 'ready'     // continuous only: completed at least once, ready for next run
  | 'rejected'; // phase was rejected, waiting for re-run

export interface PhaseConfig {
  id: number;
  name: string;
  type: PhaseType;
  description: string;
  dependencies: number[]; // phase IDs that must be approved/ready first
}

export interface LogEntry {
  timestamp: string;
  type: 'ok' | 'info' | 'warn' | 'error';
  message: string;
}

export type VersionStatus = 'running' | 'review' | 'approved' | 'rejected';

export interface OutputVersion {
  id: string;
  createdAt: string;
  action: 'generated' | 'edited' | 'restored';
  status: VersionStatus;
  data: Record<string, unknown>;
  note?: string;
}

export interface PhaseState {
  phaseId: number;
  status: PhaseStatus;
  log: LogEntry[];
  output: Record<string, unknown> | null;
  versions: OutputVersion[];
  currentVersionId: string | null;
  lastRunAt: string | null; // for continuous phases
  input: Record<string, unknown> | null;
  systemPrompt: string;
  systemPromptModified: boolean;
  rejectionFeedback: string | null;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  createdAt: string;
  updatedAt: string;
  archived: boolean;
  phases: Record<number, PhaseState>;
}

export type NotificationType =
  | 'approval_pending'
  | 'agent_done'
  | 'rejected'
  | 'reminder';

export interface Notification {
  id: string;
  projectId: string;
  projectName: string;
  phaseId: number;
  phaseName: string;
  type: NotificationType;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface OutputItem {
  id: string;
  content: string;
  source: 'ai' | 'manual';
}

export interface RiskItem {
  id: string;
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  citation?: string;
}

export interface TicketItem {
  id: string;
  type: 'epic' | 'story' | 'task';
  name: string;
  points: number;
  parentId?: string;
}

export interface TestResult {
  id: string;
  scenario: string;
  status: 'passed' | 'failed' | 'skipped';
  description?: string;
  severity?: 'critical' | 'high' | 'medium' | 'low';
}

// API-specific types
export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AgentRun {
  id: string;
  phaseStateId: number;
  versionId: string | null;
  status: 'queued' | 'running' | 'completed' | 'failed';
  llmModel: string | null;
  tokensIn: number | null;
  tokensOut: number | null;
  error: string | null;
  startedAt: string;
  finishedAt: string | null;
}

export interface UploadedFile {
  id: string;
  projectId: string;
  phaseId: number;
  originalName: string;
  storedPath: string;
  extractedText: string | null;
  createdAt: string;
}
