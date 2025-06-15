import { InstallmentPlan } from "../models/InstallmentPlan";

export class InstallmentPlanInterface {
static fromEntity(plan: InstallmentPlan): InstallmentPlanInterface | null {
  if (!plan) return null;
  return new InstallmentPlanInterface({
    id: plan.id,
    invoiceId: plan.invoiceId,
    totalAmount: plan.totalAmount,
    numberOfInstallments: plan.numberOfInstallments,
    completedInstallments: plan.completedInstallments,
    isCompleted: plan.isCompleted,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
    deletedAt: plan.deletedAt,
  });
}
static validate(data: Partial<InstallmentPlanInterface>): string[] {
  const errors: string[] = [];

  if (!data.invoiceId || typeof data.invoiceId !== 'string') {
    errors.push('invoiceId must be a valid string');
  }
  if (data.totalAmount === undefined || data.totalAmount <= 0 || isNaN(data.totalAmount)) {
    errors.push('totalAmount must be a positive number');
  }
  if (data.numberOfInstallments === undefined || data.numberOfInstallments < 1 || isNaN(data.numberOfInstallments)) {
    errors.push('numberOfInstallments must be at least 1');
  }

  return errors;
}

  id!: string;
  invoiceId!: string;
  totalAmount!: number;
  numberOfInstallments!: number;
  completedInstallments!: number;
  isCompleted!: boolean;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;

  constructor(data: Partial<InstallmentPlanInterface>) {
    Object.assign(this, {
      id: data.id || '',
      invoiceId: data.invoiceId || '',
      totalAmount: data.totalAmount || 0,
      numberOfInstallments: data.numberOfInstallments || 1,
      completedInstallments: data.completedInstallments || 0,
      isCompleted: data.isCompleted ?? false,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      deletedAt: data.deletedAt,
    });
  }

 

  static toRequest(data: InstallmentPlanInterface): InstallmentPlanRequestInterface {
    return new InstallmentPlanRequestInterface({
      invoiceId: data.invoiceId,
      totalAmount: data.totalAmount,
      numberOfInstallments: data.numberOfInstallments,
      completedInstallments: data.completedInstallments,
      isCompleted: data.isCompleted,
    });
  }
}

export class InstallmentPlanRequestInterface {
  invoiceId!: string;
  totalAmount!: number;
  numberOfInstallments!: number;
  completedInstallments?: number;
  isCompleted?: boolean;

  constructor(data: Partial<InstallmentPlanRequestInterface>) {
    Object.assign(this, {
      invoiceId: data.invoiceId || '',
      totalAmount: data.totalAmount || 0,
      numberOfInstallments: data.numberOfInstallments || 1,
      completedInstallments: data.completedInstallments,
      isCompleted: data.isCompleted,
    });
  }

  static toEntity(data: InstallmentPlanRequestInterface): InstallmentPlanInterface {
    return new InstallmentPlanInterface({
      invoiceId: data.invoiceId,
      totalAmount: data.totalAmount,
      numberOfInstallments: data.numberOfInstallments,
      completedInstallments: data.completedInstallments,
      isCompleted: data.isCompleted,
    });
  }
}