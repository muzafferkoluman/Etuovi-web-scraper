import { FastifyInstance } from 'fastify';
import { dbRepository } from '@koti-scout/database';
import { searchService } from '../services/search.service';

export async function systemRoutes(server: FastifyInstance) {
  // GET /api/system/provider
  server.get('/provider', async (_request, reply) => {
    const { total } = await dbRepository.getProperties({});
    return reply.send({
      provider: searchService.getProviderName(),
      status: 'healthy',
      propertiesAvailable: total,
      mode: searchService.getProviderName() === 'MockPropertyProvider' ? 'demo' : 'production',
      timezone: process.env.DEFAULT_TIMEZONE || 'Europe/Helsinki'
    });
  });
}
