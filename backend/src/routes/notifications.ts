import type { FastifyInstance } from 'fastify';
import * as notificationService from '../services/notificationService.js';
import { SYSTEM_USER_ID } from '../config.js';

export async function notificationRoutes(app: FastifyInstance) {
  // List notifications
  app.get('/', async () => {
    return notificationService.listNotifications(SYSTEM_USER_ID);
  });

  // Mark as read
  app.post('/:id/read', async (request) => {
    const { id } = request.params as { id: string };
    await notificationService.markAsRead(SYSTEM_USER_ID, id);
    return { ok: true };
  });

  // Mark all as read
  app.post('/read-all', async () => {
    await notificationService.markAllAsRead(SYSTEM_USER_ID);
    return { ok: true };
  });
}
