import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, OneToOne, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';
import { IsUUID, IsNotEmpty, IsDateString, IsNumber, IsPositive, Length, IsBoolean, IsOptional, ArrayMinSize, IsArray, ValidateIf } from 'class-validator';
import { TicketType } from './TicketType';
import { Event } from './Event';
import { User } from './User';
import { Venue } from './Venue';
import { Payment } from './Payment'; // Import Payment
import { Invoice } from './Invoice'; // Import Invoice

@Entity('registrations')
export class Registration {
    @PrimaryGeneratedColumn('uuid')
    @IsUUID('4', { message: 'registrationId must be a valid UUID' })
    registrationId!: string;

    @ManyToOne(() => Event, event => event.registrations, { nullable: false, eager: true })
    @JoinColumn({ name: 'eventId' }) // Use JoinColumn with name for explicit foreign key column
    event!: Event;

    // Direct foreign key column for eventId
    @Column({ type: 'uuid' })
    eventId!: string;

    @ManyToOne(() => User, user => user.registrationsAsAttendee, { nullable: false, eager: true })
    @JoinColumn({ name: 'userId' })
    user!: User;

    // Direct foreign key column for userId
    @Column({ type: 'uuid' })
    userId!: string;

    @ManyToOne(() => User, user => user.registrationsAsBuyer, { nullable: false, eager: true })
    @JoinColumn({ name: 'buyerId' })
    buyer!: User;

    // Direct foreign key column for buyerId
    @Column({ type: 'uuid' })
    buyerId!: string;

    // --- CRUCIAL CHANGE HERE ---
    // Define the column to use PostgreSQL's native UUID array type
    @Column('uuid', { array: true, nullable: true, default: () => "'{}'" }) // 'uuid' for element type, array: true for array
    @IsOptional()
    @IsArray({ message: 'boughtForIds must be an array' })
    @IsUUID('4', { each: true, message: 'Each boughtForId must be a valid UUID' })
    @ValidateIf(o => o.boughtForIds !== undefined && o.boughtForIds !== null && o.boughtForIds.length > 0) // Better validation condition
    boughtForIds?: string[];
    // --- END CRUCIAL CHANGE ---

    @ManyToOne(() => TicketType, ticketType => ticketType.registrations, { nullable: false, eager: true })
    @JoinColumn({ name: 'ticketTypeId' })
    @IsNotEmpty({ message: 'A ticket type is required' })
    ticketType!: TicketType;

    // Direct foreign key column for ticketTypeId
    @Column({ type: 'uuid' })
    ticketTypeId!: string;

    @ManyToOne(() => Venue, venue => venue.registrations, { nullable: false, eager: true })
    @JoinColumn({ name: 'venueId' })
    venue!: Venue;

    // Direct foreign key column for venueId
    @Column({ type: 'uuid' })
    venueId!: string;

    @Column({ type: 'int' })
    @IsNumber({}, { message: 'noOfTickets must be a number' })
    @IsPositive({ message: 'noOfTickets must be a positive number' })
    @IsNotEmpty({ message: 'noOfTickets is required' })
    noOfTickets!: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0.00 })
    totalCost!: number;

    @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    @IsDateString({}, { message: 'registrationDate must be a valid ISO date string' })
    registrationDate!: Date; // Change to Date type to match TypeORM's handling of timestamptz

    @Column({ default: 'pending' })
    @IsNotEmpty({ message: 'paymentStatus is required' })
    @Length(3, 50, { message: 'paymentStatus must be between 3 and 50 characters' })
    paymentStatus!: string;

    @Column('varchar', { length: 255, nullable: true })
    qrCode?: string;

    @Column({ type: 'timestamptz', nullable: true })
    @IsOptional()
    @IsDateString({}, { message: 'checkDate must be a valid ISO date string if provided' })
    checkDate?: Date; // Change to Date type

    @Column({ type: 'boolean', default: false })
    @IsBoolean({ message: 'attended must be a boolean value' })
    attended!: boolean;

    @Column({ type: 'varchar', length: 50, default: 'active' })
    registrationStatus!: string;

    @OneToOne(() => Payment, payment => payment.registration, { cascade: true, onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'paymentId' })
    payment?: Payment;

    @Column({ type: 'uuid', nullable: true }) // Explicit foreign key column
    paymentId?: string; // Add paymentId here, matched by @JoinColumn

    @OneToOne(() => Invoice, invoice => invoice.registration, { cascade: true, onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'invoiceId' })
    invoice?: Invoice;

    @Column({ type: 'uuid', nullable: true }) // Explicit foreign key column
    invoiceId?: string; // Correctly place invoiceId here

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt!: Date;

    @DeleteDateColumn({ type: 'timestamptz', nullable: true })
    deletedAt?: Date; // Make sure this property matches the decorator
}