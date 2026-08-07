import { FastifyInstance } from 'fastify';
import { PropertyFiltersSchema } from '@koti-scout/shared';
import { searchService } from '../services/search.service';

export async function propertyRoutes(server: FastifyInstance) {
  // GET /api/properties/search
  server.get('/search', async (request, reply) => {
    const parseResult = PropertyFiltersSchema.safeParse(request.query);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Invalid search parameters',
        details: parseResult.error.format()
      });
    }

    const results = await searchService.search(parseResult.data);
    return reply.send(results);
  });

  // GET /api/properties/:id
  server.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const details = await searchService.getPropertyDetails(id);
    if (!details) {
      return reply.status(404).send({ error: 'Property not found' });
    }
    return reply.send(details.property);
  });

  // GET /api/properties/:id/history
  server.get('/:id/history', async (request, reply) => {
    const { id } = request.params as { id: string };
    const details = await searchService.getPropertyDetails(id);
    if (!details) {
      return reply.status(404).send({ error: 'Property not found' });
    }
    return reply.send({
      propertyId: id,
      snapshots: details.snapshots,
      events: details.events
    });
  });
}
