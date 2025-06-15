import { PaymentInterface } from './PaymentInterface';
import { RegistrationInterface } from './RegistrationInterface';

export class InvoiceInterface {
  invoiceId!: string;
  eventId!: string;
  userId!: string;
  invoiceDate!: string;
  dueDate!: string;
  totalAmount!: number;
  status!: string;
  payments?: PaymentInterface[];
  registration?: RegistrationInterface;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;

  constructor(data: Partial<InvoiceInterface>) {
    Object.assign(this, {
      invoiceId: data.invoiceId || '',
      eventId: data.eventId || '',
      userId: data.userId || '',
      invoiceDate: data.invoiceDate || new Date().toISOString(),
      dueDate: data.dueDate || new Date().toISOString(),
      totalAmount: data.totalAmount || 0,
      status: data.status || 'pending',
      payments: data.payments,
      registration: data.registration,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      deletedAt: data.deletedAt,
    });
  }

  static validate(data: Partial<InvoiceInterface>): string[] {
    const errors: string[] = [];
    if (!data.eventId) errors.push('eventId is required');
    if (!data.userId) errors.push('userId is required');
    if (!data.invoiceDate) errors.push('invoiceDate is required');
    if (!data.dueDate) errors.push('dueDate is required');
    if (!data.totalAmount || data.totalAmount < 0) errors.push('totalAmount must be non-negative');
    return errors;
  }

  static toRequest(data: InvoiceInterface): InvoiceRequestInterface {
    return new InvoiceRequestInterface({
      invoiceId: data.invoiceId,
      eventId: data.eventId,
      userId: data.userId,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      totalAmount: data.totalAmount,
      status: data.status,
      registrationId: data.registration?.registrationId,
    });
  }
}

export class InvoiceRequestInterface {
  invoiceId?: string;
  eventId!: string;
  userId!: string;
  invoiceDate!: string;
  dueDate!: string;
  totalAmount!: number;
  status!: string;
  registrationId?: string;

  constructor(data: Partial<InvoiceRequestInterface>) {
    Object.assign(this, {
      invoiceId: data.invoiceId,
      eventId: data.eventId || '',
      userId: data.userId || '',
      invoiceDate: data.invoiceDate || new Date().toISOString(),
      dueDate: data.dueDate || new Date().toISOString(),
      totalAmount: data.totalAmount || 0,
      status: data.status || 'pending',
      registrationId: data.registrationId,
    });
  }

  static toEntity(data: InvoiceRequestInterface): InvoiceInterface {
    return new InvoiceInterface({
      invoiceId: data.invoiceId,
      eventId: data.eventId,
      userId: data.userId,
      invoiceDate: data.invoiceDate,
      dueDate: data.dueDate,
      totalAmount: data.totalAmount,
      status: data.status,
      registration: data.registrationId ? { registrationId: data.registrationId } as RegistrationInterface : undefined,
    });
  }
}