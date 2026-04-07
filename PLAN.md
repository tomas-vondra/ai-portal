# AI Portal - Implementation Plan

## Current State

- **Frontend**: Complete UI with Zustand stores, all 13 phase components, mock data
- **Backend**: Fastify API, PostgreSQL (Drizzle ORM), BullMQ worker, Redis pub/sub SSE, 13 AI agents
- **Shared types**: Aligned between frontend and backend
- **Auth**: MVP single system user (no real auth)

The frontend and backend are **not connected** - the frontend runs entirely on mock data.

---

## Phase 1: Connect Frontend to Backend API

### 1.1 Vite Dev Proxy
- [ ] Add proxy config in `frontend/vite.config.ts` to forward `/api/v1` to `localhost:3001`

### 1.2 Project Store -> API
- [ ] Replace mock data initialization in `projectStore.ts` with `projectApi.list()` fetch
- [ ] Wire `createProject` to `projectApi.create()`
- [ ] Wire `deleteProject` to `projectApi.delete()`
- [ ] Wire `archiveProject` to `projectApi.archive()`
- [ ] Wire project update (name, client) to `projectApi.update()`
- [ ] Fetch single project with phases via `projectApi.get(id)` on detail page

### 1.3 Phase Operations -> API
- [ ] Wire `startAgent` to `phaseApi.start()` (returns `runId`)
- [ ] Wire `retryAgent` to `phaseApi.retry()`
- [ ] Wire `approvePhase` to `phaseApi.approve()`
- [ ] Wire `rejectPhase` to `phaseApi.reject()`
- [ ] Wire `rejectApprovedPhase` to `phaseApi.rejectApproved()`
- [ ] Wire `updateOutput` (manual edit) to `phaseApi.updateOutput()`
- [ ] Wire `restoreVersion` to `phaseApi.restoreVersion()`
- [ ] Wire `setPhaseInput` to `phaseApi.setInput()`
- [ ] Wire system prompt update/reset to `phaseApi.updateSystemPrompt()` / `resetSystemPrompt()`
- [ ] Wire JSON export to `phaseApi.exportJson()`

### 1.4 Notification Store -> API
- [ ] Replace mock notifications with `notificationApi.list()` fetch
- [ ] Wire `markAsRead` to `notificationApi.markRead()`
- [ ] Wire `markAllAsRead` to `notificationApi.markAllRead()`

### 1.5 File Uploads -> API
- [ ] Wire file upload in phase components to `fileApi.upload()`
- [ ] Fetch file list via `fileApi.list()`
- [ ] Wire file download/text extraction to `fileApi.download()` / `fileApi.text()`

---

## Phase 2: Wire SSE Real-Time Streams

### 2.1 Agent Log Streaming
- [ ] After `startAgent`/`retryAgent` returns `runId`, connect `useLogStream` hook
- [ ] Feed SSE log entries into store (replace setTimeout simulation)
- [ ] Handle completion event (update phase status, set output)
- [ ] Handle error event (set phase to error status)

### 2.2 Notification Streaming
- [ ] Connect `useNotificationStream` hook in `NotificationPanel` or app-level
- [ ] Push new notifications into notification store on SSE events
- [ ] Show toast/indicator for new notifications

---

## Phase 3: Error Handling & Loading States

- [ ] Add loading states to store (isLoading per operation)
- [ ] Show loading spinners/skeletons during API calls
- [ ] Handle API errors gracefully (toast notifications, error boundaries)
- [ ] Handle network disconnects (SSE reconnection is already in hooks)
- [ ] Optimistic updates where appropriate (e.g., mark notification as read)

---

## Phase 4: Polish & Production Readiness

- [ ] Authentication system (replace system user with real login)
- [ ] Input validation on frontend forms (match backend Zod schemas)
- [ ] Remove all mock data files once API integration is complete
- [ ] Environment-based API URL config
- [ ] Health check integration (show backend status in UI)
- [ ] Rate limiting on API endpoints
- [ ] Tests (backend API integration tests, frontend store tests)

---

## Infrastructure Notes

- **Docker Compose**: `docker-compose up` starts postgres, redis, api, worker
- **Backend dev**: `npm run dev` (API) + `npm run dev:worker` (worker) from `backend/`
- **Frontend dev**: `npm run dev` from `frontend/`
- **DB setup**: `npm run db:migrate && npm run db:seed` from `backend/`
