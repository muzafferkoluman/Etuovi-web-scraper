import { FastifyInstance } from 'fastify';
import { dbRepository } from '@koti-scout/database';

export async function notificationsRoutes(server: FastifyInstance) {
  const currentUserId = 'user-demo-01';

  // GET /api/notifications
  server.get('/', async (_request, reply) => {
    const list = await dbRepository.getNotifications(currentUserId);
    const unreadCount = list.filter(n => !n.read).length;
    return reply.send({
      notifications: list,
      unreadCount
    });
  });

  // PATCH /api/notifications/:id/read
  server.patch('/:id/read', async (request, reply) => {
    const { id } = request.params as { id: string };
    const success = await dbRepository.markNotificationAsRead(id);
    if (!success) {
      return reply.status(404).send({ error: 'Notification not found' });
    }
    return reply.send({ success: true, id });
  });

  // PATCH /api/notifications/read-all
  server.patch('/read-all', async (_request, reply) => {
    const count = await dbRepository.markAllNotificationsAsRead(currentUserId);
    return reply.send({ success: true, markedCount: count });
  });
}
