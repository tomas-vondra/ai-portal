import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/auth.js';
import * as phaseService from '../services/phaseService.js';
import { enqueueAgentJob } from '../services/agentService.js';
import { AppError } from '../middleware/errorHandler.js';

export async function phaseRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);

  // Get phase with versions
  app.get('/:id/phases/:phaseId', async (request) => {
    const { id, phaseId } = request.params as { id: string; phaseId: string };
    return phaseService.getPhase(id, parseInt(phaseId, 10));
  });

  // Set input
  app.put('/:id/phases/:phaseId/input', async (request) => {
    const { id, phaseId } = request.params as { id: string; phaseId: string };
    const input = request.body as Record<string, unknown>;
    await phaseService.setInput(id, parseInt(phaseId, 10), input);
    return { ok: true };
  });

  // Update system prompt
  app.put('/:id/phases/:phaseId/system-prompt', async (request) => {
    const { id, phaseId } = request.params as { id: string; phaseId: string };
    const { prompt } = request.body as { prompt: string };
    if (!prompt) throw new AppError(400, 'Prompt is required');
    await phaseService.updateSystemPrompt(id, parseInt(phaseId, 10), prompt);
    return { ok: true };
  });

  // Reset system prompt
  app.post('/:id/phases/:phaseId/system-prompt/reset', async (request) => {
    const { id, phaseId } = request.params as { id: string; phaseId: string };
    await phaseService.resetSystemPrompt(id, parseInt(phaseId, 10));
    return { ok: true };
  });

  // Start agent
  app.post('/:id/phases/:phaseId/start', async (request) => {
    const { id, phaseId } = request.params as { id: string; phaseId: string };
    const pid = parseInt(phaseId, 10);
    const { runId, phaseStateId } = await phaseService.startAgent(id, pid);
    await enqueueAgentJob({ projectId: id, phaseId: pid, phaseStateId, versionId: runId });
    return { runId };
  });

  // Retry agent
  app.post('/:id/phases/:phaseId/retry', async (request) => {
    const { id, phaseId } = request.params as { id: string; phaseId: string };
    const pid = parseInt(phaseId, 10);
    const { runId, phaseStateId } = await phaseService.retryAgent(id, pid);
    await enqueueAgentJob({ projectId: id, phaseId: pid, phaseStateId, versionId: runId });
    return { runId };
  });

  // Approve
  app.post('/:id/phases/:phaseId/approve', async (request) => {
    const { id, phaseId } = request.params as { id: string; phaseId: string };
    await phaseService.approvePhase(id, parseInt(phaseId, 10));
    return { ok: true };
  });

  // Reject (from review)
  app.post('/:id/phases/:phaseId/reject', async (request) => {
    const { id, phaseId } = request.params as { id: string; phaseId: string };
    const { feedback } = request.body as { feedback: string };
    await phaseService.rejectPhase(id, parseInt(phaseId, 10), feedback ?? '');
    return { ok: true };
  });

  // Reject approved (+ BFS cascade)
  app.post('/:id/phases/:phaseId/reject-approved', async (request) => {
    const { id, phaseId } = request.params as { id: string; phaseId: string };
    const { feedback } = request.body as { feedback: string };
    await phaseService.rejectApprovedPhase(id, parseInt(phaseId, 10), feedback ?? '');
    return { ok: true };
  });

  // Edit output (creates new version)
  app.put('/:id/phases/:phaseId/output', async (request) => {
    const { id, phaseId } = request.params as { id: string; phaseId: string };
    const output = request.body as Record<string, unknown>;
    await phaseService.updateOutput(id, parseInt(phaseId, 10), output);
    return { ok: true };
  });

  // Restore version
  app.post('/:id/phases/:phaseId/versions/:versionId/restore', async (request) => {
    const { id, phaseId, versionId } = request.params as { id: string; phaseId: string; versionId: string };
    await phaseService.restoreVersion(id, parseInt(phaseId, 10), versionId);
    return { ok: true };
  });

  // Export phase output as JSON
  app.get('/:id/phases/:phaseId/export/json', async (request, reply) => {
    const { id, phaseId } = request.params as { id: string; phaseId: string };
    const phase = await phaseService.getPhase(id, parseInt(phaseId, 10));
    if (!phase.output) throw new AppError(404, 'No output to export');

    reply.header('Content-Type', 'application/json');
    reply.header('Content-Disposition', `attachment; filename="F${phaseId}-output.json"`);
    return JSON.stringify(phase.output, null, 2);
  });
}
