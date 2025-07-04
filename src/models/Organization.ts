import {
  Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn
} from 'typeorm';
import { IsUUID, IsNotEmpty, IsOptional, Length, IsEmail, IsPhoneNumber, IsString } from 'class-validator';
import { Event } from './Event';
import { User } from './User';
import { VenueBooking } from './VenueBooking';
import { Venue } from './Venue';
import { VenueInvoice } from './VenueInvoice';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID('4', { message: 'organizationId must be a valid UUID' })
  organizationId!: string;

  @Column({ unique: true })
  @IsNotEmpty({ message: 'organizationName is required' })
  @Length(3, 100, { message: 'organizationName must be between $constraint1 and $constraint2 characters' })
  organizationName!: string;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @Length(0, 500, { message: 'description must be at most $constraint2 characters' })
  description?: string;

  @Column()
  @IsEmail({}, { message: 'contactEmail must be a valid email address' })
  @IsNotEmpty({ message: 'contactEmail is required' })
  contactEmail!: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsPhoneNumber(undefined, { message: 'contactPhone must be a valid phone number' })
  contactPhone?: string;

  @Column({ nullable: true })
  @IsOptional()
  @Length(0, 200, { message: 'address must be at most $constraint2 characters' })
  address?: string;

  @Column({ nullable: true })
  @IsOptional()
  @Length(0, 50, { message: 'organizationType must be at most $constraint2 characters' })
  organizationType?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString({ message: 'city must be a string' })
  @Length(0, 50, { message: 'city must be at most $constraint2 characters' })
  city?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString({ message: 'country must be a string' })
  @Length(0, 50, { message: 'country must be at most $constraint2 characters' })
  country?: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  @IsString({ message: 'postalCode must be a string' })
  @Length(0, 20, { message: 'postalCode must be at most $constraint2 characters' })
  postalCode?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  @IsOptional()
  @IsString({ message: 'stateProvince must be a string' })
  @Length(0, 50, { message: 'stateProvince must be at most $constraint2 characters' })
  stateProvince?: string;

  // --- Relationships ---
  // Many-to-Many with User
  @ManyToMany(() => User, (user) => user.organizations)
  users!: User[];

  // Relationship to Events (Organizer)
  @OneToMany(() => Event, (event) => event.organization)
  events!: Event[];

  // Relationship to Venues (Owned by Organization)
  @OneToMany(() => Venue, (venue) => venue.organization)
  venues!: Venue[];

  // Relationship to VenueBookings
  @OneToMany(() => VenueBooking, (booking) => booking.organization)
  bookings!: VenueBooking[];

  // Relationship to VenueInvoices
  @OneToMany(() => VenueInvoice, (venueInvoice) => venueInvoice.organization)
  venueInvoices!: VenueInvoice[];

  // --- Timestamp Columns ---
  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deletedAt?: Date;
}