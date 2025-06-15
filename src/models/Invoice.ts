// src/models/Invoice.ts
import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { IsUUID, IsDateString, IsNumber, IsEnum, IsString, IsNotEmpty, Min, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

// --- Enums for better type safety ---
import { InvoiceStatus } from '../interfaces/Enums/InvoiceStatus';

// Assuming these exist and are properly defined
import { User } from './User';
import { Event } from './Event';
import { Payment } from './Payment';
import { Registration } from './Registration';
import { InstallmentPlan } from './InstallmentPlan';

@Entity('invoices')
export class Invoice {
    @PrimaryGeneratedColumn('uuid') // <--- CHANGE THIS LINE
    @IsUUID()
    invoiceId!: string;

    @Column({ type: 'uuid' })
    @IsUUID()
    @IsNotEmpty()
    eventId!: string;

    @Column({ type: 'uuid' })
    @IsUUID()
    @IsNotEmpty()
    userId!: string; // User who is responsible for or is the recipient of the invoice

    @Column({ type: 'timestamp' })
    @IsDateString() // Validates if it's a valid date string (e.g., ISO 8601)
    @IsNotEmpty()
    invoiceDate!: Date; // Use Date object internally

    @Column({ type: 'timestamp' })
    @IsDateString() // Validates if it's a valid date string (e.g., ISO 8601)
    @IsNotEmpty()
    dueDate!: Date; // Use Date object internally

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    @IsNumber()
    @Min(0)
    @IsNotEmpty()
    totalAmount!: number;

    @Column({ type: 'enum', enum: InvoiceStatus, default: InvoiceStatus.PENDING })
    @IsEnum(InvoiceStatus)
    @IsNotEmpty()
    status!: InvoiceStatus; // Use enum for status

    @Column({ type: 'uuid', nullable: true })
    @IsOptional()
    @IsUUID()
    registrationId?: string; // Foreign key to Registration

    // Relationships
    @ManyToOne(() => Event, event => event.invoices) // Assuming 'invoices' property exists on Event entity
    @JoinColumn({ name: 'eventId' })
    event?: Event;

    @ManyToOne(() => User, user => user.invoices) // Assuming 'invoices' property exists on User entity
    @JoinColumn({ name: 'userId' })
    user?: User;

    @OneToMany(() => Payment, payment => payment.invoice)
    payments?: Payment[];
    
  @OneToMany(() => InstallmentPlan, plan => plan.invoice)
installmentPlans!: InstallmentPlan[];
    @OneToOne(() => Registration, registration => registration.invoice, { nullable: true })
    @JoinColumn({ name: 'registrationId' })
    registration?: Registration;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt!: Date;

    @Column({ type: 'timestamp', nullable: true })
    deletedAt?: Date;
}