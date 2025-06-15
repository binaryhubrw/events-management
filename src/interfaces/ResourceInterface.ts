export class ResourceInterface {
  resourceId!: string;
  resourceName!: string;
  description!: string;
  costPerUnit!: number;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;

  constructor(data: Partial<ResourceInterface>) {
    Object.assign(this, {
      resourceId: data.resourceId || '',
      resourceName: data.resourceName || '',
      description: data.description || '',
      costPerUnit: data.costPerUnit || 0,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      deletedAt: data.deletedAt,
    });
  }

  static validate(data: Partial<ResourceInterface>): string[] {
    const errors: string[] = [];
    if (!data.resourceName) errors.push('resourceName is required');
    if (!data.description) errors.push('description is required');
    if (!data.costPerUnit || data.costPerUnit < 0) errors.push('costPerUnit must be non-negative');
    return errors;
  }
}