import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/auth.js';
import { createRedisSubscriber } from '../redis.js';

export async function sseRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);

  // SSE: Stream agent logs for a specific run
  app.get('/projects/:id/phases/:phaseId/log/stream', async (request, reply) => {
    const { id, phaseId } = request.params as { id: string; phaseId: string };
    const { runId } = request.query as { runId: string };

    if (!runId) {
      return reply.status(400).send({ error: 'runId query parameter is required' });
    }

    const channel = `log:${id}:${phaseId}:${runId}`;

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    const subscriber = createRedisSubscriber();
    await subscriber.subscribe(channel);

    subscriber.on('message', (_ch: string, message: string) => {
      reply.raw.write(`data: ${message}\n\n`);
    });

    // Also subscribe to the done channel
    const doneChannel = `done:${id}:${phaseId}:${runId}`;
    await subscriber.subscribe(doneChannel);

    // Heartbeat to detect disconnects
    const heartbeat = setInterval(() => {
      reply.raw.write(': heartbeat\n\n');
    }, 15000);

    // Cleanup on disconnect
    request.raw.on('close', () => {
      clearInterval(heartbeat);
      subscriber.unsubscribe(channel, doneChannel);
      subscriber.quit();
    });
  });

  // SSE: Notification stream for current user
  app.get('/notifications/stream', async (request, reply) => {
    const userId = request.user!.id;
    const channel = `notifications:${userId}`;

    reply.raw.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    const subscriber = createRedisSubscriber();
    await subscriber.subscribe(channel);

    subscriber.on('message', (_ch: string, message: string) => {
      reply.raw.write(`data: ${message}\n\n`);
    });

    const heartbeat = setInterval(() => {
      reply.raw.write(': heartbeat\n\n');
    }, 15000);

    request.raw.on('close', () => {
      clearInterval(heartbeat);
      subscriber.unsubscribe(channel);
      subscriber.quit();
    });
  });
}
