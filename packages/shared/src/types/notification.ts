export type NotificationType =
  | 'NEW_PROPERTY'
  | 'PRICE_DROP'
  | 'PROPERTY_REMOVED'
  | 'HIGH_SCORE_PROPERTY';

export interface NotificationPayload {
  userId: string;
  savedSearchId?: string | null;
  propertyId?: string | null;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

export interface AppNotification {
  id: string;
  userId: string;
  savedSearchId: string | null;
  propertyId: string | null;

  type: NotificationType;

  title: string;
  message: string;

  read: boolean;

  createdAt: string;

  // Enriched optional info
  propertyTitle?: string;
  propertyAddress?: string;
  propertyPrice?: number;
  propertyScore?: number;
  propertyThumbnail?: string;
}
