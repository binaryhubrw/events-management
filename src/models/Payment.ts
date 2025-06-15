import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Invoice } from './Invoice';
import { Registration } from './Registration';
import { InstallmentPlan } from './InstallmentPlan';
import { Event } from './Event';
import { PaymentStatus } from '../interfaces/Enums/PaymentStatusEnum';

@Entity()
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  paymentId!: string;

  @Column()
  invoiceId!: string;

  @ManyToOne(() => Invoice, { eager: true })
  @JoinColumn({ name: 'invoiceId' })
  invoice?: Invoice;

  @Column({ nullable: true })
  registrationId?: string;

  @ManyToOne(() => Registration, { eager: true })
  @JoinColumn({ name: 'registrationId' })
  registration?: Registration;

  @Column({ nullable: true })
  eventId?: string;

  @ManyToOne(() => Event, (event) => event.payments, { eager: true })
  @JoinColumn({ name: 'eventId' })
  event?: Event;

  @Column()
  paymentDate!: Date;

  @Column('decimal')
  paidAmount!: number;

  @Column()
  paymentMethod!: string;

  @Column({ type: 'enum', enum: PaymentStatus })
  paymentStatus!: PaymentStatus;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  txRef?: string;

  @Column({ nullable: true })
  flwRef?: string;

  @Column()
  isSuccessful!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  paymentResponse?: any;

  @Column()
  isInstallment!: boolean;

  @Column({ nullable: true })
  installmentNumber?: number;

  @Column({ nullable: true })
  installmentPlanId?: string;

 @ManyToOne(() => InstallmentPlan, (installmentPlan) => installmentPlan.payments, { eager: true })
  installmentPlan!: InstallmentPlan;


  @Column({ nullable: true })
  paidBy?: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt!: Date;

  @DeleteDateColumn({ type: 'timestamp with time zone', nullable: true })
  deletedAt?: Date;
}