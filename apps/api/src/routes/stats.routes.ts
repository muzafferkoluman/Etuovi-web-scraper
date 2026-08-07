import { FastifyInstance } from 'fastify';
import { dbRepository } from '@koti-scout/database';

export async function statsRoutes(server: FastifyInstance) {
  // GET /api/stats/dashboard
  server.get('/dashboard', async (request, reply) => {
    const userId = request.user.id;
    const stats = await dbRepository.getDashboardStats(userId);
    return reply.send(stats);
  });
}
