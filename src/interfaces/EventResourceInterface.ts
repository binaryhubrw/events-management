export class EventResourceInterface {
  eventResourceId!: string;
  eventId!: string;
  resourceId!: string;
  quantity!: number;
  amountSpent!: number;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;

  constructor(data: Partial<EventResourceInterface>) {
    Object.assign(this, {
      eventResourceId: data.eventResourceId || '',
      eventId: data.eventId || '',
      resourceId: data.resourceId || '',
      quantity: data.quantity || 0,
      amountSpent: data.amountSpent || 0,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      deletedAt: data.deletedAt,
    });
  }

  static validate(data: Partial<EventResourceInterface>): string[] {
    const errors: string[] = [];
    if (!data.eventId) errors.push('eventId is required');
    if (!data.resourceId) errors.push('resourceId is required');
    if (!data.quantity || data.quantity <= 0) errors.push('quantity must be greater than 0');
    return errors;
  }
}