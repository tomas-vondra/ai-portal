import { eq, and, desc } from 'drizzle-orm';
import { db } from '../db/index.js';
import { notifications, projects } from '../db/schema.js';
import { getPhaseConfig } from '@ai-portal/shared';
import type { Notification, NotificationType } from '@ai-portal/shared';
import { AppError } from '../middleware/errorHandler.js';

export async function listNotifications(userId: string): Promise<Notification[]> {
  const rows = await db.select({
    id: notifications.id,
    projectId: notifications.projectId,
    projectName: projects.name,
    phaseId: notifications.phaseId,
    type: notifications.type,
    message: notifications.message,
    read: notifications.read,
    createdAt: notifications.createdAt,
  })
    .from(notifications)
    .innerJoin(projects, eq(notifications.projectId, projects.id))
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(100);

  return rows.map((r) => ({
    id: r.id,
    projectId: r.projectId,
    projectName: r.projectName,
    phaseId: r.phaseId,
    phaseName: getPhaseConfig(r.phaseId).name,
    type: r.type as NotificationType,
    message: r.message,
    createdAt: r.createdAt.toISOString(),
    read: r.read,
  }));
}

export async function createNotification(
  userId: string,
  projectId: string,
  phaseId: number,
  type: NotificationType,
  message: string,
) {
  await db.insert(notifications).values({
    userId,
    projectId,
    phaseId,
    type,
    message,
  });
}

export async function markAsRead(userId: string, notificationId: string) {
  const [updated] = await db.update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
    .returning({ id: notifications.id });

  if (!updated) throw new AppError(404, 'Notification not found');
}

export async function markAllAsRead(userId: string) {
  await db.update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
}
