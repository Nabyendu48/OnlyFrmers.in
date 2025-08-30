import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Auction } from '../../auctions/entities/auction.entity';
import { Listing } from '../../listings/entities/listing.entity';

export enum EscrowStatus {
  PENDING = 'PENDING',
  HELD = 'HELD',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
  DISPUTED = 'DISPUTED',
  EXPIRED = 'EXPIRED',
}

export enum EscrowType {
  AUCTION_DEPOSIT = 'AUCTION_DEPOSIT',
  TRANSACTION_DEPOSIT = 'TRANSACTION_DEPOSIT',
  INSPECTION_DEPOSIT = 'INSPECTION_DEPOSIT',
}

@Entity('escrow_holds')
@Index(['buyerId'])
@Index(['auctionId'])
@Index(['listingId'])
@Index(['status', 'createdAt'])
@Index(['paymentIntentId'], { unique: true })
export class EscrowHold {
  @ApiProperty({ description: 'Unique identifier for the escrow hold' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Buyer user ID' })
  @Column({ type: 'uuid' })
  buyerId: string;

  @ApiProperty({ description: 'Associated auction ID (if applicable)' })
  @Column({ type: 'uuid', nullable: true })
  auctionId: string;

  @ApiProperty({ description: 'Associated listing ID' })
  @Column({ type: 'uuid' })
  listingId: string;

  @ApiProperty({ description: 'Type of escrow hold' })
  @Column({
    type: 'enum',
    enum: EscrowType,
    default: EscrowType.AUCTION_DEPOSIT,
  })
  type: EscrowType;

  @ApiProperty({ description: 'Current escrow status' })
  @Column({
    type: 'enum',
    enum: EscrowStatus,
    default: EscrowStatus.PENDING,
  })
  status: EscrowStatus;

  @ApiProperty({ description: 'Amount held in escrow (10% of total)' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ description: 'Total transaction amount' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  totalAmount: number;

  @ApiProperty({ description: 'Payment gateway payment intent ID' })
  @Column({ type: 'varchar', length: 255, unique: true })
  paymentIntentId: string;

  @ApiProperty({ description: 'Payment gateway transaction ID' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  transactionId: string;

  @ApiProperty({ description: 'Payment gateway used' })
  @Column({ type: 'varchar', length: 50 })
  paymentGateway: string;

  @ApiProperty({ description: 'Escrow hold expiry time' })
  @Column({ type: 'timestamp' })
  expiryTime: Date;

  @ApiProperty({ description: 'When escrow was actually held' })
  @Column({ type: 'timestamp', nullable: true })
  heldAt: Date;

  @ApiProperty({ description: 'When escrow was released' })
  @Column({ type: 'timestamp', nullable: true })
  releasedAt: Date;

  @ApiProperty({ description: 'When escrow was refunded' })
  @Column({ type: 'timestamp', nullable: true })
  refundedAt: Date;

  @ApiProperty({ description: 'Reason for escrow hold' })
  @Column({ type: 'text', nullable: true })
  reason: string;

  @ApiProperty({ description: 'Additional metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ApiProperty({ description: 'Escrow creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Escrow last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.escrowHolds)
  @JoinColumn({ name: 'buyerId' })
  buyer: User;

  @ManyToOne(() => Auction, (auction) => auction.escrowHolds)
  @JoinColumn({ name: 'auctionId' })
  auction: Auction;

  @ManyToOne(() => Listing, (listing) => listing.escrowHolds)
  @JoinColumn({ name: 'listingId' })
  listing: Listing;

  // Virtual properties
  @ApiProperty({ description: 'Whether escrow is currently active' })
  get isActive(): boolean {
    return this.status === EscrowStatus.HELD;
  }

  @ApiProperty({ description: 'Whether escrow has expired' })
  get isExpired(): boolean {
    return new Date() > this.expiryTime;
  }

  @ApiProperty({ description: 'Time remaining until expiry in seconds' })
  get timeRemaining(): number {
    const remaining = this.expiryTime.getTime() - new Date().getTime();
    return Math.max(0, Math.floor(remaining / 1000));
  }

  @ApiProperty({ description: 'Percentage of total amount held' })
  get percentageHeld(): number {
    return (this.amount / this.totalAmount) * 100;
  }

  @ApiProperty({ description: 'Formatted escrow amount' })
  get formattedAmount(): string {
    return `₹${this.amount.toFixed(2)}`;
  }

  @ApiProperty({ description: 'Formatted total amount' })
  get formattedTotalAmount(): string {
    return `₹${this.totalAmount.toFixed(2)}`;
  }
}
