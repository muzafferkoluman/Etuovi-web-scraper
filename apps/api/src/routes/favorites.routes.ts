import { FastifyInstance } from 'fastify';
import { CreateFavoriteSchema, UpdateFavoriteSchema } from '@koti-scout/shared';
import { dbRepository } from '@koti-scout/database';

export async function favoritesRoutes(server: FastifyInstance) {
  // GET /api/favorites
  server.get('/', async (request, reply) => {
    const userId = request.user.id;
    const favs = await dbRepository.getFavorites(userId);
    return reply.send(favs);
  });

  // POST /api/favorites
  server.post('/', async (request, reply) => {
    const userId = request.user.id;
    const parseResult = CreateFavoriteSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Invalid favorite payload',
        details: parseResult.error.format()
      });
    }

    const { propertyId, notes } = parseResult.data;
    const favorite = await dbRepository.addFavorite(userId, propertyId, notes);
    return reply.status(201).send(favorite);
  });

  // PATCH /api/favorites/:propertyId/notes
  server.patch('/:propertyId/notes', async (request, reply) => {
    const userId = request.user.id;
    const { propertyId } = request.params as { propertyId: string };
    const parseResult = UpdateFavoriteSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: 'Invalid notes format' });
    }

    const updated = await dbRepository.updateFavorite(userId, propertyId, parseResult.data.notes);
    if (!updated) {
      return reply.status(404).send({ error: 'Favorite not found' });
    }
    return reply.send(updated);
  });

  // DELETE /api/favorites/:propertyId
  server.delete('/:propertyId', async (request, reply) => {
    const userId = request.user.id;
    const { propertyId } = request.params as { propertyId: string };
    const removed = await dbRepository.removeFavorite(userId, propertyId);
    if (!removed) {
      return reply.status(404).send({ error: 'Favorite not found' });
    }
    return reply.send({ success: true, propertyId });
  });
}
