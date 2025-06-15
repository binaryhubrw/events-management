import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { IsUUID, IsNotEmpty, IsOptional, Length, IsArray } from 'class-validator';
import { User } from './User';

@Entity('roles')
export class Role {
  @PrimaryGeneratedColumn('uuid')
  @IsUUID('4')
  roleId!: string;

  @Column({ unique: true })
  @IsNotEmpty()
  @Length(3, 50)
  roleName!: string;

  @Column('simple-array', { nullable: true })
  @IsOptional()
  @IsArray()
  permissions?: string[];

  @Column({ nullable: true })
  @IsOptional()
  @Length(0, 500)
  description?: string;

  @OneToMany(() => User, user => user.role) // Adjusted for one role to many users
  users!: User[];
  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
