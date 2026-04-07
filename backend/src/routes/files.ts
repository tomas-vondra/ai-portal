import type { FastifyInstance } from 'fastify';
import * as fileService from '../services/fileService.js';

export async function fileRoutes(app: FastifyInstance) {

  // Upload file
  app.post('/projects/:id/phases/:phaseId/files', async (request, reply) => {
    const { id, phaseId } = request.params as { id: string; phaseId: string };
    const file = await request.file();
    if (!file) return reply.status(400).send({ error: 'No file uploaded' });

    const buffer = await file.toBuffer();
    const result = await fileService.uploadFile(id, parseInt(phaseId, 10), file.filename, buffer);
    return reply.status(201).send(result);
  });

  // List files for a phase
  app.get('/projects/:id/phases/:phaseId/files', async (request) => {
    const { id, phaseId } = request.params as { id: string; phaseId: string };
    return fileService.listFiles(id, parseInt(phaseId, 10));
  });

  // Download file
  app.get('/files/:fileId', async (request, reply) => {
    const { fileId } = request.params as { fileId: string };
    const { buffer, filename } = await fileService.getFileBuffer(fileId);
    reply.header('Content-Disposition', `attachment; filename="${filename}"`);
    return reply.send(buffer);
  });

  // Get extracted text
  app.get('/files/:fileId/text', async (request) => {
    const { fileId } = request.params as { fileId: string };
    const text = await fileService.getFileText(fileId);
    return { text };
  });
}
