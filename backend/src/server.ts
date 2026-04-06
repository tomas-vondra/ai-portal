import Fastify from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import multipart from '@fastify/multipart';
import { config } from './config.js';
import { authRoutes } from './routes/auth.js';
import { projectRoutes } from './routes/projects.js';
import { phaseRoutes } from './routes/phases.js';
import { fileRoutes } from './routes/files.js';
import { notificationRoutes } from './routes/notifications.js';
import { sseRoutes } from './routes/sse.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = Fastify({ logger: true });

// Plugins
await app.register(cors, {
  origin: true,
  credentials: true,
});
await app.register(cookie, {
  secret: config.SESSION_SECRET,
});
await app.register(multipart, {
  limits: { fileSize: config.MAX_FILE_SIZE_MB * 1024 * 1024 },
});

// Error handler
app.setErrorHandler(errorHandler);

// Health check
app.get('/api/v1/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

// Routes
await app.register(authRoutes, { prefix: '/api/v1/auth' });
await app.register(projectRoutes, { prefix: '/api/v1/projects' });
await app.register(phaseRoutes, { prefix: '/api/v1/projects' });
await app.register(fileRoutes, { prefix: '/api/v1' });
await app.register(notificationRoutes, { prefix: '/api/v1/notifications' });
await app.register(sseRoutes, { prefix: '/api/v1' });

// Start
try {
  await app.listen({ port: config.PORT, host: config.HOST });
  console.log(`Server listening on ${config.HOST}:${config.PORT}`);
} catch (err) {
  app.log.error(err);
  process.exit(1);
}

export { app };
