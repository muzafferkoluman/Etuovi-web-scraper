import { emailDispatcher } from "../services/email.service";
import { FastifyInstance } from "fastify";
import { dbRepository } from "@koti-scout/database";

export async function notificationsRoutes(server: FastifyInstance) {
  // GET /api/notifications
  server.get("/", async (request, reply) => {
    const userId = request.user.id;
    const list = await dbRepository.getNotifications(userId);
    const unreadCount = list.filter((n) => !n.read).length;
    return reply.send({
      notifications: list,
      unreadCount
    });
  });

  // PATCH /api/notifications/:id/read
  server.patch("/:id/read", async (request, reply) => {
    const userId = request.user.id;
    const { id } = request.params as { id: string };
    const success = await dbRepository.markNotificationAsRead(id, userId);
    if (!success) {
      return reply.status(404).send({ error: "Notification not found" });
    }
    return reply.send({ success: true, id });
  });

  // POST /api/notifications/test-email
  server.post("/test-email", async (request, reply) => {
    const { to } = (request.body as { to?: string }) || {};
    const result = await emailDispatcher.sendTestEmail(to);
    return reply.send(result);
  });

  // PATCH /api/notifications/read-all
  server.patch("/read-all", async (request, reply) => {
    const userId = request.user.id;
    const count = await dbRepository.markAllNotificationsAsRead(userId);
    return reply.send({ success: true, markedCount: count });
  });
}
