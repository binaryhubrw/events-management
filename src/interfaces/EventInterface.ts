import { EventStatus } from './Enums/EventStatusEnum';
import { EventType} from './Enums/EventTypeEnum';
import { UserInterface } from './UserInterface';
import { VenueInterface } from './VenueInterface';
import { VenueBookingInterface } from './VenueBookingInterface';
import { RegistrationInterface } from './RegistrationInterface';
import { PaymentInterface } from './PaymentInterface';
import { InvoiceInterface } from './InvoiceInterface';

export class EventInterface {
  eventId!: string;
  eventTitle!: string;
  description?: string;
  eventCategory?: string;
  eventType!: EventType;
  startDate!: Date; // Note: Add to Event.ts
  endDate!: Date; // Note: Add to Event.ts
  startTime!: string; // Note: Add to Event.ts
  endTime!: string; // Note: Add to Event.ts
  maxAttendees?: number;
  status!: EventStatus;
  isFeatured!: boolean;
  qrCode?: string;
  imageURL?: string;
  organizerId!: string;
  venueId!: string;
  organizer?: UserInterface;
  venue?: VenueInterface;
  bookings?: VenueBookingInterface[];
  registrations?: RegistrationInterface[];
  payments?: PaymentInterface[];
  invoices?: InvoiceInterface[];
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;

  constructor(data: Partial<EventInterface>) {
    Object.assign(this, {
      eventId: data.eventId || '',
      eventTitle: data.eventTitle || '',
      description: data.description,
      eventCategory: data.eventCategory,
      eventType: data.eventType || EventType.PUBLIC,
      startDate: data.startDate || new Date(),
      endDate: data.endDate || new Date(),
      startTime: data.startTime || '',
      endTime: data.endTime || '',
      maxAttendees: data.maxAttendees,
      status: data.status || EventStatus.DRAFT,
      isFeatured: data.isFeatured ?? false,
      qrCode: data.qrCode,
      imageURL: data.imageURL,
      organizerId: data.organizerId || '',
      venueId: data.venueId || '',
      organizer: data.organizer,
      venue: data.venue,
      bookings: data.bookings,
      registrations: data.registrations,
      payments: data.payments,
      invoices: data.invoices,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      deletedAt: data.deletedAt,
    });
  }

  static validate(data: Partial<EventInterface>): string[] {
    const errors: string[] = [];
    if (!data.eventTitle) errors.push('Event title is required');
    if (data.eventTitle && (data.eventTitle.length < 3 || data.eventTitle.length > 100)) {
      errors.push('Event title must be between 3 and 100 characters');
    }
    if (data.description && data.description.length > 5000) {
      errors.push('Description must be at most 5000 characters long');
    }
    if (data.eventCategory && data.eventCategory.length > 50) {
      errors.push('Event category must be at most 50 characters long');
    }
    if (!Object.values(EventType).includes(data.eventType!)) {
      errors.push(`Event type must be one of: ${Object.values(EventType).join(', ')}`);
    }
    if (data.maxAttendees && (typeof data.maxAttendees !== 'number' || data.maxAttendees < 1)) {
      errors.push('Max attendees must be an integer and at least 1');
    }
    if (!Object.values(EventStatus).includes(data.status!)) {
      errors.push(`Invalid event status: must be one of ${Object.values(EventStatus).join(', ')}`);
    }
    if (typeof data.isFeatured !== 'boolean') {
      errors.push('isFeatured must be a boolean');
    }
    if (data.qrCode && data.qrCode.length > 255) {
      errors.push('QR Code must be at most 255 characters long');
    }
    if (data.imageURL && data.imageURL.length > 255) {
      errors.push('Image URL must be at most 255 characters long');
    }
    if (!data.organizerId) errors.push('Organizer ID is required');
    if (!data.venueId) errors.push('Venue ID is required');
    return errors;
  }

  static toRequest(data: EventInterface): EventRequestInterface {
    return new EventRequestInterface({
      eventId: data.eventId,
      eventTitle: data.eventTitle,
      description: data.description,
      eventCategory: data.eventCategory,
      eventType: data.eventType,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString(),
      startTime: data.startTime,
      endTime: data.endTime,
      maxAttendees: data.maxAttendees,
      status: data.status,
      isFeatured: data.isFeatured,
      qrCode: data.qrCode,
      imageURL: data.imageURL,
      organizerId: data.organizerId,
      venueId: data.venueId,
    });
  }

  static toResponse(data: EventInterface): EventResponseInterface {
    return new EventResponseInterface({
      eventId: data.eventId,
      eventTitle: data.eventTitle,
      description: data.description,
      eventCategory: data.eventCategory,
      eventType: data.eventType,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString(),
      startTime: data.startTime,
      endTime: data.endTime,
      maxAttendees: data.maxAttendees,
      status: data.status,
      isFeatured: data.isFeatured,
      qrCode: data.qrCode,
      imageURL: data.imageURL,
      organizer: data.organizer,
      venue: data.venue,
      bookings: data.bookings,
      registrations: data.registrations,
      payments: data.payments,
      invoices: data.invoices,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
      deletedAt: data.deletedAt?.toISOString(),
    });
  }
}

export class EventRequestInterface {
  eventId?: string;
  eventTitle!: string;
  description?: string;
  eventCategory?: string;
  eventType!: EventType;
  startDate!: string;
  endDate!: string;
  startTime!: string;
  endTime!: string;
  maxAttendees?: number;
  status!: EventStatus;
  isFeatured?: boolean;
  qrCode?: string;
  imageURL?: string;
  organizerId!: string;
  venueId!: string;

  constructor(data: Partial<EventRequestInterface>) {
    Object.assign(this, {
      eventId: data.eventId,
      eventTitle: data.eventTitle || '',
      description: data.description,
      eventCategory: data.eventCategory,
      eventType: data.eventType || EventType.PUBLIC,
      startDate: data.startDate || new Date().toISOString(),
      endDate: data.endDate || new Date().toISOString(),
      startTime: data.startTime || '',
      endTime: data.endTime || '',
      maxAttendees: data.maxAttendees,
      status: data.status || EventStatus.DRAFT,
      isFeatured: data.isFeatured,
      qrCode: data.qrCode,
      imageURL: data.imageURL,
      organizerId: data.organizerId || '',
      venueId: data.venueId || '',
    });
  }

  static toEntity(data: EventRequestInterface): EventInterface {
    return new EventInterface({
      eventId: data.eventId,
      eventTitle: data.eventTitle,
      description: data.description,
      eventCategory: data.eventCategory,
      eventType: data.eventType,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      startTime: data.startTime,
      endTime: data.endTime,
      maxAttendees: data.maxAttendees,
      status: data.status,
      isFeatured: data.isFeatured ?? false,
      qrCode: data.qrCode,
      imageURL: data.imageURL,
      organizerId: data.organizerId,
      venueId: data.venueId,
    });
  }
}

export class EventResponseInterface {
  eventId!: string;
  eventTitle!: string;
  description?: string;
  eventCategory?: string;
  eventType!: EventType;
  startDate!: string;
  endDate!: string;
  startTime!: string;
  endTime!: string;
  maxAttendees?: number;
  status!: EventStatus;
  isFeatured!: boolean;
  qrCode?: string;
  imageURL?: string;
  organizer?: UserInterface;
  venue?: VenueInterface;
  bookings?: VenueBookingInterface[];
  registrations?: RegistrationInterface[];
  payments?: PaymentInterface[];
  invoices?: InvoiceInterface[];
  createdAt!: string;
  updatedAt!: string;
  deletedAt?: string;

  constructor(data: Partial<EventResponseInterface>) {
    Object.assign(this, {
      eventId: data.eventId || '',
      eventTitle: data.eventTitle || '',
      description: data.description,
      eventCategory: data.eventCategory,
      eventType: data.eventType || EventType.PUBLIC,
      startDate: data.startDate || new Date().toISOString(),
      endDate: data.endDate || new Date().toISOString(),
      startTime: data.startTime || '',
      endTime: data.endTime || '',
      maxAttendees: data.maxAttendees,
      status: data.status || EventStatus.DRAFT,
      isFeatured: data.isFeatured ?? false,
      qrCode: data.qrCode,
      imageURL: data.imageURL,
      organizer: data.organizer,
      venue: data.venue,
      bookings: data.bookings,
      registrations: data.registrations,
      payments: data.payments,
      invoices: data.invoices,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: data.updatedAt || new Date().toISOString(),
      deletedAt: data.deletedAt,
    });
  }

  static fromEntity(data: EventInterface): EventResponseInterface {
    return new EventResponseInterface({
      eventId: data.eventId,
      eventTitle: data.eventTitle,
      description: data.description,
      eventCategory: data.eventCategory,
      eventType: data.eventType,
      startDate: data.startDate.toISOString(),
      endDate: data.endDate.toISOString(),
      startTime: data.startTime,
      endTime: data.endTime,
      maxAttendees: data.maxAttendees,
      status: data.status,
      isFeatured: data.isFeatured,
      qrCode: data.qrCode,
      imageURL: data.imageURL,
      organizer: data.organizer,
      venue: data.venue,
      bookings: data.bookings,
      registrations: data.registrations,
      payments: data.payments,
      invoices: data.invoices,
      createdAt: data.createdAt.toISOString(),
      updatedAt: data.updatedAt.toISOString(),
      deletedAt: data.deletedAt?.toISOString(),
    });
  }
}