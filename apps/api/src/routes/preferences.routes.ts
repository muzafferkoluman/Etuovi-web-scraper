import { FastifyInstance } from 'fastify';
import { UserPreferencesSchema } from '@koti-scout/shared';
import { dbRepository } from '@koti-scout/database';

export async function preferencesRoutes(server: FastifyInstance) {
  const currentUserId = 'user-demo-01';

  // GET /api/preferences
  server.get('/', async (_request, reply) => {
    const prefs = await dbRepository.getUserPreferences(currentUserId);
    return reply.send(prefs);
  });

  // PATCH /api/preferences
  server.patch('/', async (request, reply) => {
    const parseResult = UserPreferencesSchema.partial().safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Invalid preferences payload',
        details: parseResult.error.format()
      });
    }

    const updated = await dbRepository.updateUserPreferences(currentUserId, parseResult.data);
    return reply.send(updated);
  });
}
