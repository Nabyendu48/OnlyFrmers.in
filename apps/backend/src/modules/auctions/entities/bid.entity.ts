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
import { Auction } from './auction.entity';
import { User } from '../../users/entities/user.entity';

export enum BidStatus {
  ACTIVE = 'ACTIVE',
  OUTBID = 'OUTBID',
  WITHDRAWN = 'WITHDRAWN',
  WINNING = 'WINNING',
  EXPIRED = 'EXPIRED',
}

@Entity('bids')
@Index(['auctionId'])
@Index(['bidderId'])
@Index(['auctionId', 'amount'])
@Index(['createdAt'])
export class Bid {
  @ApiProperty({ description: 'Unique identifier for the bid' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Associated auction ID' })
  @Column({ type: 'uuid' })
  auctionId: string;

  @ApiProperty({ description: 'Bidder user ID' })
  @Column({ type: 'uuid' })
  bidderId: string;

  @ApiProperty({ description: 'Bid amount' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @ApiProperty({ description: 'Current bid status' })
  @Column({
    type: 'enum',
    enum: BidStatus,
    default: BidStatus.ACTIVE,
  })
  status: BidStatus;

  @ApiProperty({ description: 'Whether this is an auto-bid' })
  @Column({ type: 'boolean', default: false })
  isAutoBid: boolean;

  @ApiProperty({ description: 'Maximum auto-bid amount' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxAutoBidAmount: number;

  @ApiProperty({ description: 'IP address of the bidder' })
  @Column({ type: 'varchar', length: 45, nullable: true })
  ipAddress: string;

  @ApiProperty({ description: 'User agent string' })
  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @ApiProperty({ description: 'Device fingerprint for anti-fraud' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  deviceFingerprint: string;

  @ApiProperty({ description: 'Bid creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Bid last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Auction, (auction) => auction.bids)
  @JoinColumn({ name: 'auctionId' })
  auction: Auction;

  @ManyToOne(() => User, (user) => user.bids)
  @JoinColumn({ name: 'bidderId' })
  bidder: User;

  // Virtual properties
  @ApiProperty({ description: 'Whether bid is currently winning' })
  get isWinning(): boolean {
    return this.status === BidStatus.WINNING;
  }

  @ApiProperty({ description: 'Whether bid is still active' })
  get isActive(): boolean {
    return this.status === BidStatus.ACTIVE || this.status === BidStatus.WINNING;
  }

  @ApiProperty({ description: 'Formatted bid amount' })
  get formattedAmount(): string {
    return `₹${this.amount.toFixed(2)}`;
  }
}
