import { Entity, PrimaryGeneratedColumn, Column, OneToMany, DeleteDateColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsUUID, IsNotEmpty, Length, IsNumber, IsPositive, IsOptional, Min, Max, IsBoolean, IsArray, ArrayMinSize, ArrayMaxSize, IsDate, IsDateString } from 'class-validator';
import { Registration } from './Registration';
import { TicketCategory } from '../interfaces/Enums/TicketCategoryEnum'; // Ensure this path is correct

@Entity('ticket_types')
export class TicketType {
    @PrimaryGeneratedColumn('uuid')
    @IsUUID('4', { message: 'ticketTypeId must be a valid UUID' })
    ticketTypeId!: string;

    @Column()
    @IsNotEmpty({ message: 'ticketName is required' })
    @Length(3, 50, { message: 'ticketName must be between 3 and 50 characters' })
    ticketName!: string;

    @Column({ type: 'numeric', precision: 10, scale: 2, nullable: false })
    @IsNumber({}, { message: 'Price must be a number' })
    @IsPositive({ message: 'Price must be a positive number' })
    // @IsDecimal is often not needed if you use IsNumber and handle decimal precision in database
    price!: number;

    @Column({ nullable: true, type: 'text' })
    @IsOptional()
    @Length(0, 1000, { message: 'description must be at most 1000 characters' })
    description?: string;

    @Column({
        type: 'enum', // Use 'enum' type for enums in TypeORM
        enum: TicketCategory, // Link to your TicketCategory enum
        nullable: false,
        default: TicketCategory.REGULAR // Set a default value if appropriate
    })
    @IsNotEmpty({ message: 'ticketCategory is required' })
    ticketCategory!: TicketCategory; // Use the enum type directly

    @Column({ nullable: true })
    @IsOptional()
    @Length(0, 100, { message: 'promoName must be at most 100 characters' })
    promoName?: string;

    @Column({ nullable: true, type: 'text' })
    @IsOptional()
    @Length(0, 500, { message: 'promoDescription must be at most 500 characters' })
    promoDescription?: string;

    // --- NEW FIELDS FROM TicketTypeRequest INTERFACE ---

    @Column({ type: 'int', nullable: true })
    @IsOptional()
    @IsNumber({}, { message: 'Capacity must be a number' })
    @Min(0, { message: 'Capacity cannot be negative' })
    capacity?: number; // Maximum tickets available

    @Column({ type: 'timestamp', nullable: true })
    @IsOptional()
    @IsDate({ message: 'availableFrom must be a valid date' }) // For Date objects
    // If you expect ISO strings from the frontend, you might use @IsDateString
    // @IsDateString() // If you primarily receive ISO 8601 strings
    availableFrom?: Date; // When ticket sales start

    @Column({ type: 'timestamp', nullable: true })
    @IsOptional()
    @IsDate({ message: 'availableUntil must be a valid date' })
    // @IsDateString() // If you primarily receive ISO 8601 strings
    availableUntil?: Date; // When ticket sales end

    @Column({ type: 'boolean', default: true }) // Default to true (sellable)
    @IsOptional() // Allow it to be omitted if default is set
    @IsBoolean({ message: 'isActive must be a boolean value' })
    isActive!: boolean; // Whether ticket is currently sellable

    @Column({ type: 'int', nullable: true })
    @IsOptional()
    @IsNumber({}, { message: 'minQuantity must be a number' })
    @Min(1, { message: 'minQuantity must be at least 1' })
    minQuantity?: number; // Minimum purchase quantity (for GROUP tickets)

    @Column({ type: 'int', nullable: true })
    @IsOptional()
    @IsNumber({}, { message: 'maxQuantity must be a number' })
    @Min(1, { message: 'maxQuantity must be at least 1' })
    // You might also add a @Max if there's a global max per customer
    maxQuantity?: number; // Maximum purchase quantity per customer

    @Column({ type: 'boolean', default: false }) // Default to false
    @IsOptional() // Allow it to be omitted if default is set
    @IsBoolean({ message: 'requiresVerification must be a boolean value' })
    requiresVerification!: boolean; // For STUDENT, SENIOR, PRESS tickets

    // Store perks as a JSON array in the database (or text field for simplicity)
    @Column({ type: 'jsonb', nullable: true }) // 'jsonb' for PostgreSQL, 'json' for MySQL/SQLite
    @IsOptional()
    @IsArray({ message: 'Perks must be an array' })
    @Length(1, 100, { each: true, message: 'Each perk must be between 1 and 100 characters' })
    @ArrayMinSize(0) // Allow empty array
    @ArrayMaxSize(20, { message: 'Cannot have more than 20 perks' }) // Example max perks
    perks?: string[]; // List of included perks/benefits

    // --- AUTOMATIC TIMESTAMPS (Recommended) ---
    @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt!: Date;
    // --- END NEW FIELDS ---

    @DeleteDateColumn({ name: 'deletedAt', type: 'timestamp', nullable: true })
    deletedAt?: Date;

    @OneToMany(() => Registration, (registration: Registration) => registration.ticketType, {
        cascade: false // Prevent cascading deletes to avoid accidental data loss
    })
    registrations!: Registration[];
}