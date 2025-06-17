import { UserInterface } from './UserInterface';

export class OrganizationInterface {
  organizationId!: string;
  organizationName!: string;
  description?: string;
  contactEmail!: string;
  contactPhone?: string;
  isExternal?: boolean;
  address?: string;
  organizationType?: string;
  user?: UserInterface;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;

  constructor(data: Partial<OrganizationInterface>) {
    Object.assign(this, {
      organizationId: data.organizationId || '',
      organizationName: data.organizationName || '',
      description: data.description || '',
      contactEmail: data.contactEmail || '',
      contactPhone: data.contactPhone,
      isExternal: data.isExternal ?? false,
      address: data.address || '',
      organizationType: data.organizationType || '',
      user: data.user,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      deletedAt: data.deletedAt,
    });
  }

  static validate(data: Partial<OrganizationInterface>): string[] {
    const errors: string[] = [];
    if (!data.organizationName) errors.push('organizationName is required');
    if (!data.contactEmail) errors.push('contactEmail is required');
    return errors;
  }
}