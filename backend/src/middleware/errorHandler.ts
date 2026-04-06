import type { FastifyError, FastifyReply, FastifyRequest } from 'fastify';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(error: FastifyError, request: FastifyRequest, reply: FastifyReply) {
  request.log.error(error);

  if (error instanceof AppError) {
    return reply.status(error.statusCode).send({ error: error.message });
  }

  if (error.validation) {
    return reply.status(400).send({ error: 'Validation error', details: error.validation });
  }

  return reply.status(500).send({ error: 'Internal server error' });
}
