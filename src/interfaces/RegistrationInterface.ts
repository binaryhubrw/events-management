import { PaymentStatus } from './Enums/PaymentStatusEnum';
import { EventInterface } from './EventInterface';
import { UserInterface } from './UserInterface';
import { TicketTypeInterface } from './TicketTypeInterface';
import { VenueInterface } from './VenueInterface';
import { PaymentInterface } from './PaymentInterface';
import { InvoiceInterface } from './InvoiceInterface';

export class RegistrationInterface {
  registrationId!: string;
  eventId!: string;
  userId!: string;
  buyerId?: string;
  boughtForIds?: string[];
  ticketTypeId!: string;
  venueId!: string;
  noOfTickets!: number;
  registrationDate!: string;
  paymentStatus!: PaymentStatus;
  qrCode?: string;
  checkDate?: string;
  attended!: boolean;
  totalCost!: number;
  registrationStatus!: string;
  paymentId?: string;
  invoiceId?: string;
  event?: EventInterface;
  user?: UserInterface;
  buyer?: UserInterface;
  ticketType?: TicketTypeInterface;
  venue?: VenueInterface;
  payment?: PaymentInterface;
  invoice?: InvoiceInterface;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;

  constructor(data: Partial<RegistrationInterface>) {
    Object.assign(this, {
      registrationId: data.registrationId || '',
      eventId: data.eventId || '',
      userId: data.userId || '',
      buyerId: data.buyerId,
      boughtForIds: data.boughtForIds,
      ticketTypeId: data.ticketTypeId || '',
      venueId: data.venueId || '',
      noOfTickets: data.noOfTickets || 1,
      registrationDate: data.registrationDate || new Date().toISOString(),
      paymentStatus: data.paymentStatus || PaymentStatus.PENDING,
      qrCode: data.qrCode,
      checkDate: data.checkDate,
      attended: data.attended ?? false,
      totalCost: data.totalCost || 0,
      registrationStatus: data.registrationStatus || 'active',
      paymentId: data.paymentId,
      invoiceId: data.invoiceId,
      event: data.event,
      user: data.user,
      buyer: data.buyer,
      ticketType: data.ticketType,
      venue: data.venue,
      payment: data.payment,
      invoice: data.invoice,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      deletedAt: data.deletedAt,
    });
  }

  static validate(data: Partial<RegistrationInterface>): string[] {
    const errors: string[] = [];
    if (!data.eventId) errors.push('eventId is required');
    if (!data.userId) errors.push('userId is required');
    if (!data.ticketTypeId) errors.push('ticketTypeId is required');
    if (!data.venueId) errors.push('venueId is required');
    if (!data.noOfTickets || data.noOfTickets <= 0) errors.push('noOfTickets must be greater than 0');
    if (!Object.values(PaymentStatus).includes(data.paymentStatus!)) {
      errors.push(`paymentStatus must be one of ${Object.values(PaymentStatus).join(', ')}`);
    }
    return errors;
  }

  static toRequest(data: RegistrationInterface): RegistrationRequestInterface {
    return new RegistrationRequestInterface({
      registrationId: data.registrationId,
      eventId: data.eventId,
      userId: data.userId,
      buyerId: data.buyerId,
      boughtForIds: data.boughtForIds,
      ticketTypeId: data.ticketTypeId,
      venueId: data.venueId,
      noOfTickets: data.noOfTickets,
      paymentStatus: data.paymentStatus,
      registrationDate: data.registrationDate,
      qrCode: data.qrCode,
      checkDate: data.checkDate,
      attended: data.attended,
      totalCost: data.totalCost,
      registrationStatus: data.registrationStatus,
      paymentId: data.paymentId,
      invoiceId: data.invoiceId,
    });
  }

  static toResponse(data: RegistrationInterface): RegistrationResponseInterface {
    return new RegistrationResponseInterface({
      registrationId: data.registrationId,
      event: data.event,
      user: data.user,
      buyer: data.buyer,
      boughtForIds: data.boughtForIds,
      ticketType: data.ticketType,
      venue: data.venue,
      noOfTickets: data.noOfTickets,
      registrationDate: data.registrationDate,
      paymentStatus: data.paymentStatus,
      qrCode: data.qrCode,
      checkDate: data.checkDate,
      attended: data.attended,
      totalCost: data.totalCost,
      registrationStatus: data.registrationStatus,
      payment: data.payment,
      invoice: data.invoice,
      paymentId: data.paymentId,
      invoiceId: data.invoiceId,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
      deletedAt: data.deletedAt?.toISOString(),
    });
  }
}

export class RegistrationRequestInterface {
  registrationId?: string;
  eventId!: string;
  userId!: string;
  buyerId?: string | null;
  boughtForIds?: string[];
  ticketTypeId!: string;
  venueId!: string;
  noOfTickets!: number;
  paymentStatus?: PaymentStatus;
  registrationDate?: string;
  qrCode?: string;
  checkDate?: string;
  attended?: boolean;
  totalCost?: number;
  registrationStatus?: string;
  paymentId?: string;
  invoiceId?: string;

  constructor(data: Partial<RegistrationRequestInterface>) {
    Object.assign(this, {
      registrationId: data.registrationId,
      eventId: data.eventId || '',
      userId: data.userId || '',
      buyerId: data.buyerId,
      boughtForIds: data.boughtForIds,
      ticketTypeId: data.ticketTypeId || '',
      venueId: data.venueId || '',
      noOfTickets: data.noOfTickets || 1,
      paymentStatus: data.paymentStatus || PaymentStatus.PENDING,
      registrationDate: data.registrationDate || new Date().toISOString(),
      qrCode: data.qrCode,
      checkDate: data.checkDate,
      attended: data.attended,
      totalCost: data.totalCost,
      registrationStatus: data.registrationStatus,
      paymentId: data.paymentId,
      invoiceId: data.invoiceId,
    });
  }

  static toEntity(data: RegistrationRequestInterface): RegistrationInterface {
    return new RegistrationInterface({
      registrationId: data.registrationId,
      eventId: data.eventId,
      userId: data.userId,
      buyerId: data.buyerId || undefined,
      boughtForIds: data.boughtForIds,
      ticketTypeId: data.ticketTypeId,
      venueId: data.venueId,
      noOfTickets: data.noOfTickets,
      paymentStatus: data.paymentStatus || PaymentStatus.PENDING,
      registrationDate: data.registrationDate || new Date().toISOString(),
      qrCode: data.qrCode,
      checkDate: data.checkDate,
      attended: data.attended ?? false,
      totalCost: data.totalCost || 0,
      registrationStatus: data.registrationStatus || 'active',
      paymentId: data.paymentId,
      invoiceId: data.invoiceId,
    });
  }
}

export class RegistrationResponseInterface {
  registrationId!: string;
  event?: EventInterface;
  user?: UserInterface;
  buyer?: UserInterface;
  boughtForIds?: string[];
  ticketType?: TicketTypeInterface;
  venue?: VenueInterface;
  noOfTickets!: number;
  registrationDate!: string;
  paymentStatus!: PaymentStatus;
  qrCode?: string;
  checkDate?: string;
  attended!: boolean;
  totalCost!: number;
  registrationStatus!: string;
  payment?: PaymentInterface;
  invoice?: InvoiceInterface;
  paymentId?: string;
  invoiceId?: string;
  createdAt!: string;
  updatedAt!: string;
  deletedAt?: string;

  constructor(data: Partial<RegistrationResponseInterface>) {
    Object.assign(this, {
      registrationId: data.registrationId || '',
      event: data.event,
      user: data.user,
      buyer: data.buyer,
      boughtForIds: data.boughtForIds,
      ticketType: data.ticketType,
      venue: data.venue,
      noOfTickets: data.noOfTickets || 1,
      registrationDate: data.registrationDate || new Date().toISOString(),
      paymentStatus: data.paymentStatus || PaymentStatus.PENDING,
      qrCode: data.qrCode,
      checkDate: data.checkDate,
      attended: data.attended ?? false,
      totalCost: data.totalCost || 0,
      registrationStatus: data.registrationStatus || 'active',
      payment: data.payment,
      invoice: data.invoice,
      paymentId: data.paymentId,
      invoiceId: data.invoiceId,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
      deletedAt: data.deletedAt,
    });
  }

  static fromEntity(data: RegistrationInterface): RegistrationResponseInterface {
    return new RegistrationResponseInterface({
      registrationId: data.registrationId,
      event: data.event,
      user: data.user,
      buyer: data.buyer,
      boughtForIds: data.boughtForIds,
      ticketType: data.ticketType,
      venue: data.venue,
      noOfTickets: data.noOfTickets,
      registrationDate: data.registrationDate,
      paymentStatus: data.paymentStatus,
      qrCode: data.qrCode,
      checkDate: data.checkDate,
      attended: data.attended,
      totalCost: data.totalCost,
      registrationStatus: data.registrationStatus,
      payment: data.payment,
      invoice: data.invoice,
      paymentId: data.paymentId,
      invoiceId: data.invoiceId,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
      deletedAt: data.deletedAt?.toISOString(),
    });
  }
}