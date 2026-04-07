# AI Portal - Implementation Plan

## Current State

- **Frontend**: React SPA with Zustand stores connected to backend API
- **Backend**: Fastify API, PostgreSQL (Drizzle ORM), BullMQ worker, Redis pub/sub SSE, 13 AI agents
- **Shared types**: Aligned between frontend and backend
- **Auth**: MVP single system user (no real auth)
- **Real-time**: SSE wired for agent logs and notifications

---

## Phase 1: Connect Frontend to Backend API -- DONE

### 1.1 Vite Dev Proxy
- [x] Proxy already configured in `frontend/vite.config.ts` (`/api` -> `localhost:3001`)

### 1.2 Project Store -> API
- [x] Replace mock data initialization with `projectApi.list()` fetch
- [x] Wire `createProject` to `projectApi.create()`
- [x] Wire `deleteProject` to `projectApi.delete()`
- [x] Wire `archiveProject` to `projectApi.archive()`
- [x] Fetch single project with phases via `projectApi.get(id)` on detail page

### 1.3 Phase Operations -> API
- [x] Wire `startAgent` to `phaseApi.start()` (returns `runId`)
- [x] Wire `retryAgent` to `phaseApi.retry()`
- [x] Wire `approvePhase` to `phaseApi.approve()`
- [x] Wire `rejectPhase` to `phaseApi.reject()`
- [x] Wire `rejectApprovedPhase` to `phaseApi.rejectApproved()`
- [x] Wire `updateOutput` (manual edit) to `phaseApi.updateOutput()`
- [x] Wire `restoreVersion` to `phaseApi.restoreVersion()`
- [x] Wire `setPhaseInput` to `phaseApi.setInput()`
- [x] Wire system prompt update/reset to `phaseApi.updateSystemPrompt()` / `resetSystemPrompt()`
- [x] Wire JSON export to `phaseApi.exportJson()`

### 1.4 Notification Store -> API
- [x] Replace mock notifications with `notificationApi.list()` fetch
- [x] Wire `markAsRead` to `notificationApi.markRead()`
- [x] Wire `markAllAsRead` to `notificationApi.markAllRead()`

### 1.5 File Uploads -> API
- [ ] Wire file upload in phase components to `fileApi.upload()`
- [ ] Fetch file list via `fileApi.list()`
- [ ] Wire file download/text extraction to `fileApi.download()` / `fileApi.text()`

---

## Phase 2: Wire SSE Real-Time Streams -- DONE

### 2.1 Agent Log Streaming
- [x] After `startAgent`/`retryAgent` returns `runId`, connect `useLogStream` hook
- [x] Feed SSE log entries into store (replace setTimeout simulation)
- [x] Handle completion event (refreshProject on done)
- [x] Handle error event (refreshProject on done)

### 2.2 Notification Streaming
- [x] Connect `useNotificationStream` hook in AppShell (app-level)
- [x] Push new notifications into notification store on SSE events

---

## Phase 3: Error Handling & Loading States -- DONE

- [x] Add loading states to store (isLoading)
- [x] Show loading spinners during API calls (ProjectListPage, ProjectDetailPage)
- [x] Handle API errors gracefully (toast notifications via toastStore)
- [x] Handle network disconnects (SSE reconnection already in hooks)
- [x] Optimistic updates (mark notification as read)
- [x] Disable buttons during async operations (isOperating in PhaseShell)

---

## Phase 4: Polish & Production Readiness

- [ ] Authentication system (replace system user with real login)
- [ ] Wire file uploads in Phase2Discovery and Phase6Contracts to `fileApi.upload()`
- [ ] Input validation on frontend forms (match backend Zod schemas)
- [ ] Environment-based API URL config
- [ ] Health check integration (show backend status in UI)
- [ ] Rate limiting on API endpoints
- [ ] Tests (backend API integration tests, frontend store tests)
- [ ] Wire `projectApi.update()` for inline name/client editing

---

## Infrastructure Notes

- **Docker Compose**: `docker-compose up` starts postgres, redis, api, worker
- **Backend dev**: `npm run dev` (API) + `npm run dev:worker` (worker) from `backend/`
- **Frontend dev**: `npm run dev` from `frontend/`
- **DB setup**: `npm run db:migrate && npm run db:seed` from `backend/`
