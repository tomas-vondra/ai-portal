import { pgTable, uuid, text, boolean, timestamp, integer, jsonb, serial, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Users ──────────────────────��────────────────────────
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  name: text('name').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  notifications: many(notifications),
}));

// ─── Projects ────────────────────────────────────────────
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  client: text('client').notNull(),
  archived: boolean('archived').notNull().default(false),
  createdBy: uuid('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const projectsRelations = relations(projects, ({ one, many }) => ({
  creator: one(users, { fields: [projects.createdBy], references: [users.id] }),
  phaseStates: many(phaseStates),
  uploadedFiles: many(uploadedFiles),
}));

// ─── Phase States ────────────────────────────────────────
export const phaseStates = pgTable('phase_states', {
  id: serial('id').primaryKey(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  phaseId: integer('phase_id').notNull(),
  status: text('status', {
    enum: ['locked', 'waiting', 'running', 'review', 'approved', 'error', 'ready', 'rejected'],
  }).notNull().default('locked'),
  input: jsonb('input'),
  output: jsonb('output'),
  systemPrompt: text('system_prompt').notNull().default(''),
  systemPromptModified: boolean('system_prompt_modified').notNull().default(false),
  currentVersionId: uuid('current_version_id'),
  lastRunAt: timestamp('last_run_at', { withTimezone: true }),
  rejectionFeedback: text('rejection_feedback'),
}, (table) => [
  unique('uq_project_phase').on(table.projectId, table.phaseId),
]);

export const phaseStatesRelations = relations(phaseStates, ({ one, many }) => ({
  project: one(projects, { fields: [phaseStates.projectId], references: [projects.id] }),
  outputVersions: many(outputVersions),
  logEntries: many(logEntries),
  agentRuns: many(agentRuns),
}));

// ─── Output Versions ─────────────────────────────────────
export const outputVersions = pgTable('output_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  phaseStateId: integer('phase_state_id').notNull().references(() => phaseStates.id, { onDelete: 'cascade' }),
  versionNumber: integer('version_number').notNull(),
  action: text('action', { enum: ['generated', 'edited', 'restored'] }).notNull(),
  status: text('status', { enum: ['running', 'review', 'approved', 'rejected'] }).notNull(),
  data: jsonb('data').notNull().default({}),
  note: text('note'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const outputVersionsRelations = relations(outputVersions, ({ one }) => ({
  phaseState: one(phaseStates, { fields: [outputVersions.phaseStateId], references: [phaseStates.id] }),
}));

// ─── Log Entries ─────────────────────────────────────────
export const logEntries = pgTable('log_entries', {
  id: serial('id').primaryKey(),
  phaseStateId: integer('phase_state_id').notNull().references(() => phaseStates.id, { onDelete: 'cascade' }),
  agentRunId: uuid('agent_run_id'),
  type: text('type', { enum: ['ok', 'info', 'warn', 'error'] }).notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const logEntriesRelations = relations(logEntries, ({ one }) => ({
  phaseState: one(phaseStates, { fields: [logEntries.phaseStateId], references: [phaseStates.id] }),
}));

// ─── Agent Runs ──────────────────────────────────────────
export const agentRuns = pgTable('agent_runs', {
  id: uuid('id').primaryKey().defaultRandom(),
  phaseStateId: integer('phase_state_id').notNull().references(() => phaseStates.id, { onDelete: 'cascade' }),
  versionId: uuid('version_id'),
  status: text('status', { enum: ['queued', 'running', 'completed', 'failed'] }).notNull().default('queued'),
  llmModel: text('llm_model'),
  tokensIn: integer('tokens_in'),
  tokensOut: integer('tokens_out'),
  error: text('error'),
  startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
  finishedAt: timestamp('finished_at', { withTimezone: true }),
});

export const agentRunsRelations = relations(agentRuns, ({ one }) => ({
  phaseState: one(phaseStates, { fields: [agentRuns.phaseStateId], references: [phaseStates.id] }),
}));

// ─── Uploaded Files ──────────────────────────────────────
export const uploadedFiles = pgTable('uploaded_files', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  phaseId: integer('phase_id').notNull(),
  originalName: text('original_name').notNull(),
  storedPath: text('stored_path').notNull(),
  extractedText: text('extracted_text'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const uploadedFilesRelations = relations(uploadedFiles, ({ one }) => ({
  project: one(projects, { fields: [uploadedFiles.projectId], references: [projects.id] }),
}));

// ─── Notifications ───────────────────────────────────────
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  projectId: uuid('project_id').notNull().references(() => projects.id, { onDelete: 'cascade' }),
  phaseId: integer('phase_id').notNull(),
  type: text('type', { enum: ['approval_pending', 'agent_done', 'rejected', 'reminder'] }).notNull(),
  message: text('message').notNull(),
  read: boolean('read').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, { fields: [notifications.userId], references: [users.id] }),
  project: one(projects, { fields: [notifications.projectId], references: [projects.id] }),
}));
