import { RoleInterface } from './RoleInterface';
import { OrganizationInterface } from './OrganizationInterface';

export class UserInterface {
  userId!: string;
  username!: string;
  firstName!: string;
  lastName!: string;
  email!: string;
  password?: string;
  phoneNumber?: string;
  role?: RoleInterface;
  organizations?: OrganizationInterface[];
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;

  constructor(data: Partial<UserInterface>) {
    Object.assign(this, {
      userId: data.userId || '',
      username: data.username || '',
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      email: data.email || '',
      password: data.password,
      phoneNumber: data.phoneNumber,
      role: data.role,
      organizations: data.organizations,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      deletedAt: data.deletedAt,
    });
  }

  static validate(data: Partial<UserInterface>): string[] {
    const errors: string[] = [];
    if (!data.email) errors.push('email is required');
    if (!data.username) errors.push('username is required');
    return errors;
  }
}