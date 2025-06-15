import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from "typeorm";
import {
  IsUUID,
  IsNotEmpty,
  Length,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  IsBoolean,
  IsDateString,
  IsString,
} from "class-validator";

import { Venue } from "./Venue";
import { User } from "./User";
import { VenueBooking } from "./VenueBooking";
import { Registration } from "./Registration";
import { Payment } from "./Payment";
import { Invoice } from "./Invoice";
import { EventType } from "../interfaces/Enums/EventTypeEnum";
import { EventStatus } from "../interfaces/Enums/EventStatusEnum";

@Entity("events")
export class Event {
  @PrimaryGeneratedColumn("uuid")
  @IsUUID("4", { message: "eventId must be a valid UUID" })
  eventId!: string;

  @Column()
  @IsNotEmpty({ message: "Event title is required" })
  @Length(3, 100, { message: "Event title must be between $constraint1 and $constraint2 characters" })
  eventTitle!: string;

  @Column({ type: "text", nullable: true }) // Allow null values
  @IsOptional()
  @Length(0, 5000, { message: "Description must be at most $constraint2 characters long" })
  description?: string;

  @Column({ nullable: true }) // Allow null values
  @IsOptional()
  @Length(0, 50, { message: "Event category must be at most $constraint2 characters long" })
  eventCategory?: string;

  @Column({ type: "enum", enum: EventType, default: EventType.PUBLIC })
  @IsEnum(EventType, { message: "Event type must be one of: public, private" })
  eventType!: EventType;

  @Column({ type: 'timestamp with time zone', nullable: true }) // ✅ Allow NULL values
  @IsOptional()
  @IsDateString({}, { message: "Start date must be a valid date" })
  startDate?: Date;

  @Column({ type: 'timestamp with time zone', nullable: true }) // ✅ Allow NULL values
  @IsOptional()
  @IsDateString({}, { message: "End date must be a valid date" })
  endDate?: Date;

  @Column({ nullable: true }) // Allow null values
  @IsOptional()
  @IsString({ message: "Start time must be a string" })
  startTime?: string;

  @Column({ nullable: true }) // Allow null values
  @IsOptional()
  @IsString({ message: "End time must be a string" })
  endTime?: string;

  @Column({ type: "int", nullable: true }) // ✅ Allow NULL values instead of forcing a default
  @IsOptional()
  @IsInt({ message: "Max attendees must be an integer" })
  @Min(1, { message: "Max attendees must be at least 1" })
  maxAttendees?: number;

  @Column({ type: "enum", enum: EventStatus, default: EventStatus.DRAFT })
  @IsEnum(EventStatus, { message: "Invalid event status" })
  status!: EventStatus;

  @Column({ default: false })
  @IsBoolean({ message: "isFeatured must be a boolean" })
  isFeatured!: boolean;

  @Column({ nullable: true }) // Allow null values
  @IsOptional()
  @Length(0, 255, { message: "QR Code must be at most $constraint2 characters long" })
  qrCode?: string;

  @Column({ nullable: true }) // Allow null values
  @IsOptional()
  @Length(0, 255, { message: "Image URL must be at most $constraint2 characters long" })
  imageURL?: string;

  @Column({ type: "uuid" })
  @IsNotEmpty({ message: "Organizer ID is required" })
  @IsUUID("4", { message: "Organizer ID must be a valid UUID" })
  organizerId!: string;

  @Column({ type: "uuid" })
  @IsNotEmpty({ message: "Venue ID is required" })
  @IsUUID("4", { message: "Venue ID must be a valid UUID" })
  venueId!: string;

  @ManyToOne(() => Venue, (venue) => venue.events)
  @JoinColumn({ name: "venueId" })
  venue!: Venue;

  @ManyToOne(() => User, (user) => user.eventsOrganizer, { eager: false })
  @JoinColumn({ name: "organizerId" })
  organizer!: User;

  @OneToMany(() => VenueBooking, (booking) => booking.event)
  bookings!: VenueBooking[];

  @OneToMany(() => Registration, (registration) => registration.event, { cascade: false })
  registrations!: Registration[];

  @OneToMany(() => Payment, (payment) => payment.event)
  payments!: Payment[];

  @OneToMany(() => Invoice, (invoice) => invoice.event)
  invoices?: Invoice[];

  @CreateDateColumn({ type: "timestamp with time zone" })
  createdAt!: Date;

  @UpdateDateColumn({ type: "timestamp with time zone" })
  updatedAt!: Date;

  @DeleteDateColumn({ type: "timestamp with time zone", nullable: true }) // ✅ Allow NULL values
  deletedAt?: Date;
}
