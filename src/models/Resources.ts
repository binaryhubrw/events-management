// src/entity/Resource.ts
import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import {
  IsUUID,
  IsNotEmpty,
  Length,
  IsOptional,
  IsNumber,
  IsPositive,
} from 'class-validator';
import { EventResource } from './EventResource';

@Entity('resources')
export class Resource {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID('4', { message: 'resourceId must be a valid UUID' })
  resourceId!: string;

  @Column()
  @IsNotEmpty({ message: 'resourceName is required' })
  @Length(3, 100, {
    message: 'resourceName must be between $constraint1 and $constraint2 characters',
  })
  resourceName!: string;

  @Column({ nullable: true })
  @IsOptional()
  @Length(0, 500, {
    message: 'description must be at most $constraint2 characters',
  })
  description!: string;

  @Column({ type: 'float' })
  @IsNumber({}, { message: 'costPerUnit must be a number' })
  @IsPositive({ message: 'costPerUnit must be a positive value' })
  costPerUnit!: number;

    @OneToMany(() => EventResource, (eventResource) => eventResource.resource)
    eventResources!: EventResource[];

}