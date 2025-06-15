export class BudgetInterface {
  budgetId!: string;
  eventId!: string;
  expectedAmount!: number;
  income!: number;
  expenditure!: number;
  notes!: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;

  constructor(data: Partial<BudgetInterface>) {
    Object.assign(this, {
      budgetId: data.budgetId || '',
      eventId: data.eventId || '',
      expectedAmount: data.expectedAmount || 0,
      income: data.income || 0,
      expenditure: data.expenditure || 0,
      notes: data.notes || '',
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      deletedAt: data.deletedAt,
    });
  }

  static validate(data: Partial<BudgetInterface>): string[] {
    const errors: string[] = [];
    if (!data.eventId) errors.push('eventId is required');
    if (!data.expectedAmount || data.expectedAmount < 0) errors.push('expectedAmount must be non-negative');
    return errors;
  }
}