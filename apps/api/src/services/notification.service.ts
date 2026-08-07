import { NotificationPayload, AppNotification } from '@koti-scout/shared';
import { dbRepository } from '@koti-scout/database';

export interface NotificationProvider {
  send(notification: NotificationPayload): Promise<void>;
}

export class InAppNotificationProvider implements NotificationProvider {
  public async send(payload: NotificationPayload): Promise<void> {
    const notif: AppNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId: payload.userId,
      savedSearchId: payload.savedSearchId || null,
      propertyId: payload.propertyId || null,
      type: payload.type,
      title: payload.title,
      message: payload.message,
      read: false,
      createdAt: new Date().toISOString()
    };

    if (payload.propertyId) {
      const prop = await dbRepository.getPropertyById(payload.propertyId);
      if (prop) {
        notif.propertyTitle = prop.title;
        notif.propertyAddress = `${prop.address}, ${prop.district}, ${prop.city}`;
        notif.propertyPrice = prop.price;
        notif.propertyScore = prop.score;
        notif.propertyThumbnail = prop.thumbnailUrl;
      }
    }

    await dbRepository.createNotification(notif);
  }
}

// Future adapters / templates
export class EmailNotificationProvider implements NotificationProvider {
  public async send(notification: NotificationPayload): Promise<void> {
    // Template for Resend / SendGrid email dispatch
    console.log(`[EmailNotificationProvider] Sending email to ${notification.userId}: ${notification.title}`);
  }
}

export class TelegramNotificationProvider implements NotificationProvider {
  public async send(notification: NotificationPayload): Promise<void> {
    // Template for Telegram Bot dispatch
    console.log(`[TelegramNotificationProvider] Sending telegram alert: ${notification.title}`);
  }
}

export class PushNotificationProvider implements NotificationProvider {
  public async send(notification: NotificationPayload): Promise<void> {
    // Template for Web Push / APNS dispatch
    console.log(`[PushNotificationProvider] Sending web push: ${notification.title}`);
  }
}

export class NotificationService {
  private providers: NotificationProvider[] = [new InAppNotificationProvider()];

  public registerProvider(provider: NotificationProvider): void {
    this.providers.push(provider);
  }

  public async notify(payload: NotificationPayload): Promise<void> {
    for (const provider of this.providers) {
      try {
        await provider.send(payload);
      } catch (err) {
        console.error('Notification provider error:', err);
      }
    }
  }
}

export const notificationService = new NotificationService();
