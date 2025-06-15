// src/entity/Venue.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn, // Import for createdAt
  UpdateDateColumn, // Import for updatedAt
  DeleteDateColumn, // Import for deletedAt
} from 'typeorm';
import {
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsUUID,
  Length,
  IsBoolean,
  IsOptional, // For latitude, longitude, googleMapsLink if they are truly optional
  IsUrl, // For googleMapsLink if you want URL validation
} from 'class-validator';

import { User } from './User';
import { VenueBooking } from './VenueBooking';
import { Event } from './Event';
import { Registration } from './Registration';

@Entity('venues')
export class Venue {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID('4', { message: 'venueId must be a valid UUID' })
  venueId!: string;

  @Column()
  @IsNotEmpty({ message: 'venueName is required' })
  @Length(3, 100, {
    message: 'venueName must be between $constraint1 and $constraint2 characters',
  })
  venueName!: string;

  @Column()
  @IsNumber({}, { message: 'capacity must be a number' })
  @IsPositive({ message: 'capacity must be a positive number' })
  capacity!: number;

  @Column()
  @IsNotEmpty({ message: 'location is required' })
  @Length(3, 200, {
    message: 'location must be between $constraint1 and $constraint2 characters',
  })
  location!: string;

  // Manager ID and Status Fields
  @Column({ type: 'uuid', nullable: true }) // Explicitly define type as uuid in column options
  @IsOptional() // managerId is optional as it's nullable in the column
  @IsUUID('4', { message: 'managerId must be a valid UUID', always: true }) // `always: true` ensures validation even if not explicitly passed
  managerId?: string; // Changed to optional as column is nullable

  @Column({ default: true })
  @IsBoolean({ message: 'isAvailable must be a boolean' })
  isAvailable!: boolean;

  @Column({ default: false })
  @IsBoolean({ message: 'isBooked must be a boolean' })
  isBooked!: boolean;

  // New fields for Google Maps integration (optional, but good practice)
  @Column({ type: 'double precision', nullable: true }) // 'double precision' for float numbers
  @IsOptional()
  @IsNumber({}, { message: 'latitude must be a number' })
  latitude?: number;

  @Column({ type: 'double precision', nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'longitude must be a number' })
  longitude?: number;

  @Column({ nullable: true })
  @IsOptional()
  @IsUrl({}, { message: 'googleMapsLink must be a valid URL' }) // Add IsUrl validator
  googleMapsLink?: string;

  // Relationships
  @ManyToOne(() => User, user => user.managedVenues)
  @JoinColumn({ name: 'managerId' }) // Link to the managerId column
  manager?: User; // Changed to optional as managerId is nullable

  @OneToMany(() => VenueBooking, venueBooking => venueBooking.venue) // Corrected parameter name
  bookings!: VenueBooking[];

  @OneToMany(() => Event, event => event.venue) // Assuming Event entity has a 'venue' property referencing Venue
  events!: Event[];

  @OneToMany(() => Registration, registration => registration.venue)
  registrations!: Registration[];

  // Timestamp Columns (managed by TypeORM)
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date; // Optional because it's null until soft-deleted
}