import { InvoiceInterface } from './InvoiceInterface';
import { RegistrationInterface } from './RegistrationInterface';
import { InstallmentPlanInterface } from './InstallmentPlanInterface';
import { EventInterface } from './EventInterface';
import { PaymentStatus } from './Enums/PaymentStatusEnum';
import { Payment } from '../models/Payment';

export class PaymentInterface {
  static fromEntity(p: Payment): PaymentInterface {
    return new PaymentInterface({
      paymentId: p.paymentId,
      invoiceId: p.invoiceId,
      registrationId: p.registrationId,
      eventId: p.eventId,
      paymentDate: p.paymentDate,
      paidAmount: p.paidAmount,
      paymentMethod: p.paymentMethod,
      paymentStatus: p.paymentStatus,
      description: p.description,
      txRef: p.txRef,
      flwRef: p.flwRef,
      isSuccessful: p.isSuccessful,
      paymentResponse: p.paymentResponse,
      isInstallment: p.isInstallment,
      installmentNumber: p.installmentNumber,
      installmentPlanId: p.installmentPlanId,
      paidBy: p.paidBy,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      deletedAt: p.deletedAt,
      // Add mapping for nested objects if needed
    });
  }
  paymentId!: string;
  invoiceId!: string;
  invoice?: InvoiceInterface;
  registrationId?: string;
  registration?: RegistrationInterface;
  eventId?: string;
  event?: EventInterface;
  paymentDate!: Date;
  paidAmount!: number;
  paymentMethod!: string;
  paymentStatus!: PaymentStatus;
  description?: string;
  txRef?: string;
  flwRef?: string;
  isSuccessful!: boolean;
  paymentResponse?: any;
  isInstallment!: boolean;
  installmentNumber?: number;
  installmentPlanId?: string;
  installmentPlan?: InstallmentPlanInterface;
  paidBy?: string;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;

  constructor(data: Partial<PaymentInterface>) {
    Object.assign(this, {
      paymentId: data.paymentId || '',
      invoiceId: data.invoiceId || '',
      invoice: data.invoice,
      registrationId: data.registrationId,
      registration: data.registration,
      eventId: data.eventId,
      event: data.event,
      paymentDate: data.paymentDate || new Date(),
      paidAmount: data.paidAmount || 0,
      paymentMethod: data.paymentMethod || '',
      paymentStatus: data.paymentStatus || PaymentStatus.PENDING,
      description: data.description,
      txRef: data.txRef,
      flwRef: data.flwRef,
      isSuccessful: data.isSuccessful ?? false,
      paymentResponse: data.paymentResponse,
      isInstallment: data.isInstallment ?? false,
      installmentNumber: data.installmentNumber,
      installmentPlanId: data.installmentPlanId,
      installmentPlan: data.installmentPlan,
      paidBy: data.paidBy,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      deletedAt: data.deletedAt,
    });
  }

  static validate(data: Partial<PaymentInterface>): string[] {
    const errors: string[] = [];
    if (!data.invoiceId) errors.push('invoiceId is required');
    if (!data.paidAmount || data.paidAmount <= 0) errors.push('paidAmount must be greater than 0');
    if (!data.paymentMethod) errors.push('paymentMethod is required');
    if (!Object.values(PaymentStatus).includes(data.paymentStatus!)) {
      errors.push(`paymentStatus must be one of ${Object.values(PaymentStatus).join(', ')}`);
    }
    return errors;
  }

  static toRequest(data: PaymentInterface): PaymentRequestInterface {
    return new PaymentRequestInterface({
      paymentId: data.paymentId,
      invoiceId: data.invoiceId,
      registrationId: data.registrationId,
      eventId: data.eventId,
      paymentDate: data.paymentDate.toISOString(),
      paidAmount: data.paidAmount,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus,
      description: data.description,
      txRef: data.txRef,
      flwRef: data.flwRef,
      isSuccessful: data.isSuccessful,
      paymentResponse: data.paymentResponse,
      isInstallment: data.isInstallment,
      installmentNumber: data.installmentNumber,
      installmentPlanId: data.installmentPlanId,
      paidBy: data.paidBy,
    });
  }
}

export class PaymentRequestInterface {
  paymentId?: string;
  invoiceId!: string;
  registrationId?: string;
  eventId?: string;
  paymentDate!: string;
  paidAmount!: number;
  paymentMethod!: string;
  paymentStatus!: PaymentStatus;
  description?: string;
  txRef?: string;
  flwRef?: string;
  isSuccessful?: boolean;
  paymentResponse?: any;
  isInstallment?: boolean;
  installmentNumber?: number;
  installmentPlanId?: string;
  paidBy?: string;

  constructor(data: Partial<PaymentRequestInterface>) {
    Object.assign(this, {
      paymentId: data.paymentId,
      invoiceId: data.invoiceId || '',
      registrationId: data.registrationId,
      eventId: data.eventId,
      paymentDate: data.paymentDate || new Date().toISOString(),
      paidAmount: data.paidAmount || 0,
      paymentMethod: data.paymentMethod || '',
      paymentStatus: data.paymentStatus || PaymentStatus.PENDING,
      description: data.description,
      txRef: data.txRef,
      flwRef: data.flwRef,
      isSuccessful: data.isSuccessful,
      paymentResponse: data.paymentResponse,
      isInstallment: data.isInstallment,
      installmentNumber: data.installmentNumber,
      installmentPlanId: data.installmentPlanId,
      paidBy: data.paidBy,
    });
  }

  static toEntity(data: PaymentRequestInterface): PaymentInterface {
    return new PaymentInterface({
      paymentId: data.paymentId,
      invoiceId: data.invoiceId,
      registrationId: data.registrationId,
      eventId: data.eventId,
      paymentDate: new Date(data.paymentDate),
      paidAmount: data.paidAmount,
      paymentMethod: data.paymentMethod,
      paymentStatus: data.paymentStatus,
      description: data.description,
      txRef: data.txRef,
      flwRef: data.flwRef,
      isSuccessful: data.isSuccessful ?? false,
      paymentResponse: data.paymentResponse,
      isInstallment: data.isInstallment ?? false,
      installmentNumber: data.installmentNumber,
      installmentPlanId: data.installmentPlanId,
      paidBy: data.paidBy,
    });
  }
}