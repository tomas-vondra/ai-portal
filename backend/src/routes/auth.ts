import type { FastifyInstance } from 'fastify';
import bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users, sessions } from '../db/schema.js';
import { requireAuth, requireAdmin } from '../middleware/auth.js';
import { AppError } from '../middleware/errorHandler.js';

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function authRoutes(app: FastifyInstance) {
  // Register (admin only)
  app.post('/register', { preHandler: [requireAdmin] }, async (request, reply) => {
    const { email, name, password, role } = request.body as {
      email: string;
      name: string;
      password: string;
      role?: 'admin' | 'user';
    };

    if (!email || !name || !password) {
      throw new AppError(400, 'Email, name, and password are required');
    }

    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
    if (existing.length > 0) {
      throw new AppError(409, 'Email already registered');
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const [user] = await db.insert(users).values({
      email,
      name,
      passwordHash,
      role: role ?? 'user',
    }).returning({ id: users.id, email: users.email, name: users.name, role: users.role });

    return reply.status(201).send({ id: user.id, email: user.email, name: user.name, role: user.role });
  });

  // Login
  app.post('/login', async (request, reply) => {
    const { email, password } = request.body as { email: string; password: string };

    if (!email || !password) {
      throw new AppError(400, 'Email and password are required');
    }

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new AppError(401, 'Invalid credentials');
    }

    const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    const [session] = await db.insert(sessions).values({
      userId: user.id,
      expiresAt,
    }).returning({ id: sessions.id });

    reply.setCookie('session', session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: expiresAt,
    });

    return { id: user.id, email: user.email, name: user.name, role: user.role };
  });

  // Logout
  app.post('/logout', async (request, reply) => {
    const sessionId = request.cookies?.session;
    if (sessionId) {
      await db.delete(sessions).where(eq(sessions.id, sessionId));
    }
    reply.clearCookie('session', { path: '/' });
    return { ok: true };
  });

  // Current user
  app.get('/me', { preHandler: [requireAuth] }, async (request) => {
    return request.user;
  });
}
