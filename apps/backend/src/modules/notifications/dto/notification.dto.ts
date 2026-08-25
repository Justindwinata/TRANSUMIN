export class NotificationDto {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  severity: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationToDto = (row: {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: string;
  severity: string;
  isRead: boolean;
  createdAt: Date;
}): NotificationDto => ({
  id: row.id,
  userId: row.userId,
  title: row.title,
  body: row.body,
  type: row.type,
  severity: row.severity,
  isRead: row.isRead,
  createdAt: row.createdAt.toISOString(),
});