import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { IsUUID, IsNotEmpty, IsOptional, Length, IsEmail, IsPhoneNumber } from 'class-validator';
import { Event } from './Event';
import { User } from './User';
import {  VenueBooking,  } from './VenueBooking';
@Entity('organizations')
export class Organization {
  
  @PrimaryGeneratedColumn('uuid')
  @IsUUID('4')
  organizationId!: string;

  @Column()
  @IsNotEmpty()
  @Length(3, 100)
  organizationName!: string;

  @Column({ nullable: true })
  @IsOptional()
  @Length(0, 500)
  description?: string;

  @Column()
  @IsEmail()
  @IsNotEmpty()
  contactEmail!: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsPhoneNumber()
  contactPhone?: string;

  @Column({ nullable: true })
  @IsOptional()
  @Length(0, 200)
  address?: string;

  @Column({ nullable: true })
  @IsOptional()
  @Length(0, 50)
  organizationType?: string;

  // @OneToMany(() => Event, (event) => event.organizationId)
  // events!: Event[];

  @ManyToOne(() => User, user => user.organizations)
  user!: User;
  @OneToMany(() => VenueBooking, (booking) => booking.organization)
  bookings!: VenueBooking[];
}
