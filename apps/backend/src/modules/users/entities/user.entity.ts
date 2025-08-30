import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

import { Profile } from './profile.entity';
import { Farm } from './farm.entity';
import { Listing } from '../../listings/entities/listing.entity';
import { Transaction } from '../../transactions/entities/transaction.entity';
import { EscrowHold } from '../../escrow/entities/escrow-hold.entity';

export enum UserRole {
  FARMER = 'FARMER',
  BUYER = 'BUYER',
  ADMIN = 'ADMIN',
}

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
}

export enum KYCStatus {
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  UNDER_REVIEW = 'UNDER_REVIEW',
}

@Entity('users')
@Index(['email'], { unique: true })
@Index(['phone'], { unique: true })
export class User {
  @ApiProperty({ description: 'Unique identifier for the user' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'User email address' })
  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @ApiProperty({ description: 'User phone number' })
  @Column({ type: 'varchar', length: 15, unique: true })
  phone: string;

  @ApiProperty({ description: 'User password (hashed)' })
  @Column({ type: 'varchar', length: 255 })
  @Exclude()
  password: string;

  @ApiProperty({ description: 'User role in the system' })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.BUYER,
  })
  role: UserRole;

  @ApiProperty({ description: 'User account status' })
  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.PENDING_VERIFICATION,
  })
  status: UserStatus;

  @ApiProperty({ description: 'KYC verification status' })
  @Column({
    type: 'enum',
    enum: KYCStatus,
    default: KYCStatus.PENDING,
  })
  kycStatus: KYCStatus;

  @ApiProperty({ description: 'Whether user profile is complete' })
  @Column({ type: 'boolean', default: false })
  profileComplete: boolean;

  @ApiProperty({ description: 'Whether user is verified' })
  @Column({ type: 'boolean', default: false })
  isVerified: boolean;

  @ApiProperty({ description: 'Last login timestamp' })
  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @ApiProperty({ description: 'User creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'User last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToOne(() => Profile, (profile) => profile.user)
  profile: Profile;

  @OneToMany(() => Farm, (farm) => farm.owner)
  farms: Farm[];

  @OneToMany(() => Listing, (listing) => listing.farmer)
  listings: Listing[];

  @OneToMany(() => Transaction, (transaction) => transaction.buyer)
  buyerTransactions: Transaction[];

  @OneToMany(() => Transaction, (transaction) => transaction.farmer)
  farmerTransactions: Transaction[];

  @OneToMany(() => EscrowHold, (escrowHold) => escrowHold.buyer)
  escrowHolds: EscrowHold[];

  // Virtual properties
  @ApiProperty({ description: 'User display name' })
  get displayName(): string {
    return this.profile?.name || this.email;
  }

  @ApiProperty({ description: 'Whether user can create listings' })
  get canCreateListings(): boolean {
    return this.role === UserRole.FARMER && 
           this.status === UserStatus.ACTIVE && 
           this.kycStatus === KYCStatus.VERIFIED;
  }

  @ApiProperty({ description: 'Whether user can participate in auctions' })
  get canParticipateInAuctions(): boolean {
    return this.status === UserStatus.ACTIVE && 
           this.kycStatus === KYCStatus.VERIFIED;
  }
}
