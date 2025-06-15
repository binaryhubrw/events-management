import { ApprovalStatus } from '../models/VenueBooking';
import { EventInterface } from './EventInterface';
import { VenueInterface } from './VenueInterface';
import { UserInterface } from './UserInterface';
import { OrganizationInterface } from './OrganizationInterface';

export class VenueBookingInterface {
  bookingId!: string;
  eventId!: string;
  venueId!: string;
  organizerId!: string;
  organizationId!: string;
  startDate!: Date;
  endDate!: Date;
  startTime!: string;
  endTime!: string;
  approvalStatus!: ApprovalStatus;
  event?: EventInterface;
  venue?: VenueInterface;
  organizer?: UserInterface;
  organization?: OrganizationInterface;
  createdAt!: Date;
  updatedAt!: Date;
  deletedAt?: Date;

  constructor(data: Partial<VenueBookingInterface>) {
    Object.assign(this, {
      bookingId: data.bookingId || '',
      eventId: data.eventId || '',
      venueId: data.venueId || '',
      organizerId: data.organizerId || '',
      organizationId: data.organizationId || '',
      startDate: data.startDate || new Date(),
      endDate: data.endDate || new Date(),
      startTime: data.startTime || '',
      endTime: data.endTime || '',
      approvalStatus: data.approvalStatus || ApprovalStatus.PENDING,
      event: data.event,
      venue: data.venue,
      organizer: data.organizer,
      organization: data.organization,
      createdAt: data.createdAt || new Date(),
      updatedAt: data.updatedAt || new Date(),
      deletedAt: data.deletedAt,
    });
  }

  static validate(data: Partial<VenueBookingInterface>): string[] {
    const errors: string[] = [];
    if (!data.eventId) errors.push('eventId is required');
    if (!data.venueId) errors.push('venueId is required');
    if (!data.organizerId) errors.push('organizerId is required');
    if (!data.organizationId) errors.push('organizationId is required');
    return errors;
  }
}