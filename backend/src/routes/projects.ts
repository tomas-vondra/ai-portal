import type { FastifyInstance } from 'fastify';
import * as projectService from '../services/projectService.js';
import { AppError } from '../middleware/errorHandler.js';
import { SYSTEM_USER_ID } from '../config.js';

export async function projectRoutes(app: FastifyInstance) {
  // List projects
  app.get('/', async (request) => {
    const { search, sort, archived } = request.query as {
      search?: string;
      sort?: 'date' | 'phase';
      archived?: string;
    };
    return projectService.listProjects({
      search,
      sort,
      archived: archived === 'true' ? true : archived === 'false' ? false : undefined,
    });
  });

  // Create project
  app.post('/', async (request, reply) => {
    const { name, client } = request.body as { name: string; client: string };
    if (!name || !client) throw new AppError(400, 'Name and client are required');
    const id = await projectService.createProject(name, client, SYSTEM_USER_ID);
    return reply.status(201).send({ id });
  });

  // Get project with all phases
  app.get('/:id', async (request) => {
    const { id } = request.params as { id: string };
    return projectService.getProjectById(id);
  });

  // Update project
  app.patch('/:id', async (request) => {
    const { id } = request.params as { id: string };
    const { name, client } = request.body as { name?: string; client?: string };
    return projectService.updateProject(id, { name, client });
  });

  // Delete project
  app.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    await projectService.deleteProject(id);
    return reply.status(204).send();
  });

  // Archive/unarchive
  app.post('/:id/archive', async (request) => {
    const { id } = request.params as { id: string };
    return projectService.toggleArchive(id);
  });
}
