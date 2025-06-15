// src/entity/EventResource.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import {
  IsUUID,
  IsNotEmpty,
  IsInt,
  IsPositive,
  Min,
  IsNumber,
  IsOptional,
} from 'class-validator';
import { Resource } from './Resources';

@Entity('event_resources')
export class EventResource {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID('4', { message: 'eventResourceId must be a valid UUID' })
  eventResourceId!: string;

  @Column()
  @IsNotEmpty({ message: 'eventId is required' })
  @IsUUID('4', { message: 'eventId must be a valid UUID' })
  eventId!: string;

  @Column()
  @IsNotEmpty({ message: 'resourceId is required' })
  @IsUUID('4', { message: 'resourceId must be a valid UUID' })
  resourceId!: string;

  @Column()
  @IsNotEmpty({ message: 'quantity is required' })
  @IsInt({ message: 'quantity must be an integer' })
  @IsPositive({ message: 'quantity must be a positive integer' })
  @Min(1, { message: 'quantity must be at least $constraint1' })
  quantity!: number;

  @Column({ type: 'float', nullable: true })
  @IsOptional()
  @IsNumber({}, { message: 'amountSpent must be a number' })
  @IsPositive({ message: 'amountSpent must be a positive number' })
  amountSpent!: number | null;
 
  @ManyToOne(() => Resource, (resource) => resource.eventResources)
  resource!: Resource;

}