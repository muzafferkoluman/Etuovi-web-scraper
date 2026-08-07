import { FastifyInstance } from 'fastify';
import { UserPreferencesSchema } from '@koti-scout/shared';
import { dbRepository } from '@koti-scout/database';

export async function preferencesRoutes(server: FastifyInstance) {
  // GET /api/preferences
  server.get('/', async (request, reply) => {
    const userId = request.user.id;
    const prefs = await dbRepository.getUserPreferences(userId);
    return reply.send(prefs);
  });

  // PATCH /api/preferences
  server.patch('/', async (request, reply) => {
    const userId = request.user.id;
    const parseResult = UserPreferencesSchema.partial().safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Invalid preferences payload',
        details: parseResult.error.format()
      });
    }

    const updated = await dbRepository.updateUserPreferences(userId, parseResult.data);
    return reply.send(updated);
  });
}
