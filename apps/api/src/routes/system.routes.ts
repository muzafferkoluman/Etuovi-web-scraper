import { FastifyInstance } from 'fastify';
import { dbRepository, checkDatabaseHealth, getDatabaseMode } from '@koti-scout/database';
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

  // GET /api/system/database (Step 28)
  server.get('/database', async (_request, reply) => {
    const health = await checkDatabaseHealth();
    return reply.send({
      mode: health.mode,
      healthy: health.healthy,
      latencyMs: health.latencyMs,
      timestamp: health.timestamp,
      environment: process.env.NODE_ENV || 'development'
    });
  });
}
