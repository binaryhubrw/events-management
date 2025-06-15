export class FeedbackInterface {
  feedbackId!: string;
  eventId!: string;
  userId!: string;
  rating!: number;
  comments!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;

  constructor(data: Partial<FeedbackInterface>) {
    Object.assign(this, {
      feedbackId: data.feedbackId || '',
      eventId: data.eventId || '',
      userId: data.userId || '',
      rating: data.rating || 0,
      comments: data.comments || '',
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      deletedAt: data.deletedAt,
    });
  }

  static validate(data: Partial<FeedbackInterface>): string[] {
    const errors: string[] = [];
    if (!data.eventId) errors.push('eventId is required');
    if (!data.userId) errors.push('userId is required');
    if (!data.rating || data.rating < 1 || data.rating > 5) errors.push('rating must be between 1 and 5');
    if (!data.comments) errors.push('comments are required');
    return errors;
  }
}