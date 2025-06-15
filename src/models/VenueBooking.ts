import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index, JoinColumn } from 'typeorm';
import { IsUUID, IsNotEmpty, IsDateString, Length, IsString } from 'class-validator';
import { Event } from './Event';
import { Venue } from './Venue';
import { Organization } from './Organization';
import { User } from './User';

export enum ApprovalStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
}

@Entity('venue_bookings')
export class VenueBooking {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID('4', { message: 'bookingId must be a valid UUID' })
  bookingId!: string;

   @ManyToOne(() => User, (user) => user.bookings, { nullable: false })
  user!: User; // One user can book many events

  @ManyToOne(() => Event, (event) => event.bookings, { nullable: false })
  event!: Event;

  @ManyToOne(() => Venue, (venue) => venue.bookings, { nullable: false })
  @JoinColumn({ name: "venueVenueId" }) // Ensure correct mapping
  venue!: Venue;

  @ManyToOne(() => Organization, (organization) => organization.bookings, { nullable: false })
  organization!: Organization;
  @Column({ type: 'timestamp' })
  @IsNotEmpty({ message: 'startDate is required' })
  @IsDateString({}, { message: 'startDate must be a valid ISO 8601 timestamp' })
  startDate!: Date;

  @Column({ type: 'timestamp' })
  @IsNotEmpty({ message: 'endDate is required' })
  @IsDateString({}, { message: 'endDate must be a valid ISO 8601 timestamp' })
  endDate!: Date;

  @Column({ type: 'time' })
  @IsNotEmpty({ message: 'startTime is required' })
  @Length(5, 8, { message: 'startTime must be in format HH:MM or HH:MM:SS' })
  startTime!: string;

  @Column({ type: 'time' })
  @IsNotEmpty({ message: 'endTime is required' })
  @Length(5, 8, { message: 'endTime must be in format HH:MM or HH:MM:SS' })
  endTime!: string;

  @Column({ type: 'enum', enum: ApprovalStatus, default: ApprovalStatus.PENDING })
  approvalStatus!: ApprovalStatus;
}
