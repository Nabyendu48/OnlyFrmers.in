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
import { EscrowHold } from '../../escrow/entities/escrow-hold.entity';

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export enum PaymentType {
  ESCROW_DEPOSIT = 'ESCROW_DEPOSIT',
  FINAL_PAYMENT = 'FINAL_PAYMENT',
  REFUND = 'REFUND',
  WITHDRAWAL = 'WITHDRAWAL',
}

export enum PaymentGateway {
  RAZORPAY = 'RAZORPAY',
  STRIPE = 'STRIPE',
  PAYTM = 'PAYTM',
  PHONEPE = 'PHONEPE',
  GOOGLE_PAY = 'GOOGLE_PAY',
}

@Entity('payments')
@Index(['userId'])
@Index(['auctionId'])
@Index(['listingId'])
@Index(['escrowHoldId'])
@Index(['status', 'createdAt'])
@Index(['paymentGateway', 'gatewayTransactionId'])
export class Payment {
  @ApiProperty({ description: 'Unique identifier for the payment' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'User making the payment' })
  @Column({ type: 'uuid' })
  userId: string;

  @ApiProperty({ description: 'Associated auction ID (if applicable)' })
  @Column({ type: 'uuid', nullable: true })
  auctionId: string;

  @ApiProperty({ description: 'Associated listing ID' })
  @Column({ type: 'uuid' })
  listingId: string;

  @ApiProperty({ description: 'Associated escrow hold ID (if applicable)' })
  @Column({ type: 'uuid', nullable: true })
  escrowHoldId: string;

  @ApiProperty({ description: 'Type of payment' })
  @Column({
    type: 'enum',
    enum: PaymentType,
    default: PaymentType.ESCROW_DEPOSIT,
  })
  type: PaymentType;

  @ApiProperty({ description: 'Current payment status' })
  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
  })
  status: PaymentStatus;

  @ApiProperty({ description: 'Payment amount' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ description: 'Currency code' })
  @Column({ type: 'varchar', length: 3, default: 'INR' })
  currency: string;

  @ApiProperty({ description: 'Payment gateway used' })
  @Column({
    type: 'enum',
    enum: PaymentGateway,
    default: PaymentGateway.RAZORPAY,
  })
  paymentGateway: PaymentGateway;

  @ApiProperty({ description: 'Gateway payment intent ID' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  gatewayPaymentIntentId: string;

  @ApiProperty({ description: 'Gateway transaction ID' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  gatewayTransactionId: string;

  @ApiProperty({ description: 'Gateway order ID' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  gatewayOrderId: string;

  @ApiProperty({ description: 'Payment method used' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentMethod: string;

  @ApiProperty({ description: 'Payment description' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Gateway response data' })
  @Column({ type: 'jsonb', nullable: true })
  gatewayResponse: Record<string, any>;

  @ApiProperty({ description: 'Error message if payment failed' })
  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @ApiProperty({ description: 'Error code if payment failed' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  errorCode: string;

  @ApiProperty({ description: 'Refund amount if applicable' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  refundAmount: number;

  @ApiProperty({ description: 'Refund reason if applicable' })
  @Column({ type: 'text', nullable: true })
  refundReason: string;

  @ApiProperty({ description: 'When payment was processed' })
  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;

  @ApiProperty({ description: 'When payment was refunded' })
  @Column({ type: 'timestamp', nullable: true })
  refundedAt: Date;

  @ApiProperty({ description: 'Additional metadata' })
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ApiProperty({ description: 'Payment creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Payment last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.payments)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Auction, (auction) => auction.payments)
  @JoinColumn({ name: 'auctionId' })
  auction: Auction;

  @ManyToOne(() => Listing, (listing) => listing.payments)
  @JoinColumn({ name: 'listingId' })
  listing: Listing;

  @ManyToOne(() => EscrowHold, (escrowHold) => escrowHold.payments)
  @JoinColumn({ name: 'escrowHoldId' })
  escrowHold: EscrowHold;

  // Virtual properties
  @ApiProperty({ description: 'Whether payment is successful' })
  get isSuccessful(): boolean {
    return this.status === PaymentStatus.COMPLETED;
  }

  @ApiProperty({ description: 'Whether payment is pending' })
  get isPending(): boolean {
    return this.status === PaymentStatus.PENDING || this.status === PaymentStatus.PROCESSING;
  }

  @ApiProperty({ description: 'Whether payment failed' })
  get isFailed(): boolean {
    return this.status === PaymentStatus.FAILED;
  }

  @ApiProperty({ description: 'Whether payment was refunded' })
  get isRefunded(): boolean {
    return this.status === PaymentStatus.REFUNDED || this.status === PaymentStatus.PARTIALLY_REFUNDED;
  }

  @ApiProperty({ description: 'Formatted payment amount' })
  get formattedAmount(): string {
    return `${this.currency} ${this.amount.toFixed(2)}`;
  }

  @ApiProperty({ description: 'Formatted refund amount' })
  get formattedRefundAmount(): string {
    return `${this.currency} ${this.refundAmount.toFixed(2)}`;
  }
}
