import { UserInterface } from './UserInterface';

export class RoleInterface {
  roleId!: string;
  roleName!: string;
  permissions!: string[];
  description?: string;
  users?: UserInterface[];
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;

  constructor(data: Partial<RoleInterface>) {
    Object.assign(this, {
      roleId: data.roleId || '',
      roleName: data.roleName || '',
      permissions: data.permissions || [],
      description: data.description,
      users: data.users,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      deletedAt: data.deletedAt,
    });
  }

  static validate(data: Partial<RoleInterface>): string[] {
    const errors: string[] = [];
    if (!data.roleName) errors.push('roleName is required');
    if (!data.permissions || !data.permissions.length) errors.push('at least one permission is required');
    return errors;
  }
}