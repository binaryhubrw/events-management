export class NotificationInterface {
  notificationId!: string;
  userId!: string;
  eventId?: string;
  message!: string;
  sentAt!: Date;
  isDisabled?: boolean;
  isRead?: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;

  constructor(data: Partial<NotificationInterface>) {
    Object.assign(this, {
      notificationId: data.notificationId || '',
      userId: data.userId || '',
      eventId: data.eventId,
      message: data.message || '',
      sentAt: data.sentAt || new Date(),
      isDisabled: data.isDisabled ?? false,
      isRead: data.isRead ?? false,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      deletedAt: data.deletedAt,
    });
  }

  static validate(data: Partial<NotificationInterface>): string[] {
    const errors: string[] = [];
    if (!data.userId) errors.push('userId is required');
    if (!data.message) errors.push('message is required');
    return errors;
  }
}