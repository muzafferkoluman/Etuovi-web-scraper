import { FastifyInstance } from 'fastify';
import { dbRepository } from '@koti-scout/database';

export async function statsRoutes(server: FastifyInstance) {
  const currentUserId = 'user-demo-01';

  // GET /api/stats/dashboard
  server.get('/dashboard', async (_request, reply) => {
    const stats = await dbRepository.getDashboardStats(currentUserId);
    return reply.send(stats);
  });
}
