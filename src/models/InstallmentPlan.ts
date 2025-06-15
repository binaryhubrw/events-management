import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import {
  IsUUID,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  Min,
  IsBoolean,
} from 'class-validator';
import { Payment } from './Payment'; // Assuming Payment entity is in the same directory or adjust path
import { Invoice } from './Invoice';

@Entity('installment_plans')
export class InstallmentPlan {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID('4', { message: 'ID must be a valid UUID v4' })
  id!: string;

@Column({ nullable: true })
@IsUUID('4', { message: 'Invoice ID must be a valid UUID v4' })
invoiceId?: string;

  @ManyToOne(() => Invoice, (invoice) => invoice.installmentPlans)
  @JoinColumn({ name: 'invoiceId' })
  invoice!: Invoice;

  @Column('float')
  @IsNumber({}, { message: 'Total amount must be a number' })
  @IsPositive({ message: 'Total amount must be a positive number' })
  @IsNotEmpty({ message: 'Total amount cannot be empty' })
  totalAmount!: number;

  @Column()
  @IsNumber({}, { message: 'Number of installments must be a number' })
  @Min(1, { message: 'Number of installments must be at least 1' })
  @IsNotEmpty({ message: 'Number of installments cannot be empty' })
  numberOfInstallments!: number;

  @Column({ default: 0 })
  @IsNumber({}, { message: 'Completed installments must be a number' })
  @Min(0, { message: 'Completed installments cannot be negative' })
  completedInstallments!: number;

  @Column({ default: false })
  @IsBoolean({ message: 'Is completed must be a boolean value' })
  isCompleted!: boolean;

  @OneToMany(() => Payment, (payment) => payment.installmentPlan)
  payments!: Payment[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}