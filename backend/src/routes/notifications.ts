import type { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/auth.js';
import * as notificationService from '../services/notificationService.js';

export async function notificationRoutes(app: FastifyInstance) {
  app.addHook('preHandler', requireAuth);

  // List notifications
  app.get('/', async (request) => {
    return notificationService.listNotifications(request.user!.id);
  });

  // Mark as read
  app.post('/:id/read', async (request) => {
    const { id } = request.params as { id: string };
    await notificationService.markAsRead(request.user!.id, id);
    return { ok: true };
  });

  // Mark all as read
  app.post('/read-all', async (request) => {
    await notificationService.markAllAsRead(request.user!.id);
    return { ok: true };
  });
}
