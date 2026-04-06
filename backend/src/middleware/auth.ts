import type { FastifyRequest, FastifyReply } from 'fastify';
import { eq, and, gt } from 'drizzle-orm';
import { db } from '../db/index.js';
import { sessions, users } from '../db/schema.js';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthUser;
  }
}

export async function requireAuth(request: FastifyRequest, reply: FastifyReply) {
  const sessionId = request.cookies?.session;
  if (!sessionId) {
    return reply.status(401).send({ error: 'Not authenticated' });
  }

  const result = await db
    .select({
      userId: sessions.userId,
      email: users.email,
      name: users.name,
      role: users.role,
      expiresAt: sessions.expiresAt,
    })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date())))
    .limit(1);

  if (result.length === 0) {
    return reply.status(401).send({ error: 'Session expired or invalid' });
  }

  const row = result[0];
  request.user = {
    id: row.userId,
    email: row.email,
    name: row.name,
    role: row.role as 'admin' | 'user',
  };
}

export async function requireAdmin(request: FastifyRequest, reply: FastifyReply) {
  await requireAuth(request, reply);
  if (reply.sent) return;
  if (request.user?.role !== 'admin') {
    return reply.status(403).send({ error: 'Admin access required' });
  }
}
