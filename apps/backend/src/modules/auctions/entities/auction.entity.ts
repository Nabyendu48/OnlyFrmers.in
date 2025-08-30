import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Listing } from '../../listings/entities/listing.entity';
import { User } from '../../users/entities/user.entity';
import { Bid } from './bid.entity';

export enum AuctionStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  PAUSED = 'PAUSED',
  ENDED = 'ENDED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum AuctionType {
  ENGLISH = 'ENGLISH', // Ascending price
  DUTCH = 'DUTCH',     // Descending price
  SEALED = 'SEALED',   // Sealed bids
}

@Entity('auctions')
@Index(['listingId'])
@Index(['status', 'startTime'])
@Index(['farmerId', 'status'])
export class Auction {
  @ApiProperty({ description: 'Unique identifier for the auction' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Associated listing ID' })
  @Column({ type: 'uuid' })
  listingId: string;

  @ApiProperty({ description: 'Farmer who created the auction' })
  @Column({ type: 'uuid' })
  farmerId: string;

  @ApiProperty({ description: 'Auction type' })
  @Column({
    type: 'enum',
    enum: AuctionType,
    default: AuctionType.ENGLISH,
  })
  type: AuctionType;

  @ApiProperty({ description: 'Current auction status' })
  @Column({
    type: 'enum',
    enum: AuctionStatus,
    default: AuctionStatus.SCHEDULED,
  })
  status: AuctionStatus;

  @ApiProperty({ description: 'Scheduled start time' })
  @Column({ type: 'timestamp' })
  startTime: Date;

  @ApiProperty({ description: 'Scheduled end time' })
  @Column({ type: 'timestamp' })
  endTime: Date;

  @ApiProperty({ description: 'Actual start time when auction went live' })
  @Column({ type: 'timestamp', nullable: true })
  actualStartTime: Date;

  @ApiProperty({ description: 'Actual end time when auction ended' })
  @Column({ type: 'timestamp', nullable: true })
  actualEndTime: Date;

  @ApiProperty({ description: 'Starting bid amount' })
  @Column({ type: 'decimal', precision: 10, scale: 2 })
  startingBid: number;

  @ApiProperty({ description: 'Reserve price (minimum acceptable price)' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  reservePrice: number;

  @ApiProperty({ description: 'Current highest bid amount' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  currentBid: number;

  @ApiProperty({ description: 'Minimum bid increment' })
  @Column({ type: 'decimal', precision: 10, scale: 2, default: 1.0 })
  minBidIncrement: number;

  @ApiProperty({ description: 'Anti-sniping buffer time in seconds' })
  @Column({ type: 'int', default: 30 })
  antiSnipingBuffer: number;

  @ApiProperty({ description: 'Whether auction has ended' })
  @Column({ type: 'boolean', default: false })
  isEnded: boolean;

  @ApiProperty({ description: 'Whether reserve price was met' })
  @Column({ type: 'boolean', default: false })
  reserveMet: boolean;

  @ApiProperty({ description: 'Winning bid ID' })
  @Column({ type: 'uuid', nullable: true })
  winningBidId: string;

  @ApiProperty({ description: 'Winning bidder ID' })
  @Column({ type: 'uuid', nullable: true })
  winningBidderId: string;

  @ApiProperty({ description: 'Winning bid amount' })
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  winningBidAmount: number;

  @ApiProperty({ description: 'Total number of bids placed' })
  @Column({ type: 'int', default: 0 })
  totalBids: number;

  @ApiProperty({ description: 'Number of unique bidders' })
  @Column({ type: 'int', default: 0 })
  uniqueBidders: number;

  @ApiProperty({ description: 'Auction creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Auction last update timestamp' })
  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => Listing, (listing) => listing.auctions)
  @JoinColumn({ name: 'listingId' })
  listing: Listing;

  @ManyToOne(() => User, (user) => user.farmerAuctions)
  @JoinColumn({ name: 'farmerId' })
  farmer: User;

  @OneToMany(() => Bid, (bid) => bid.auction)
  bids: Bid[];

  // Virtual properties
  @ApiProperty({ description: 'Whether auction is currently live' })
  get isLive(): boolean {
    return this.status === AuctionStatus.LIVE;
  }

  @ApiProperty({ description: 'Whether auction can be started' })
  get canStart(): boolean {
    return this.status === AuctionStatus.SCHEDULED && 
           new Date() >= this.startTime;
  }

  @ApiProperty({ description: 'Whether auction should end' })
  get shouldEnd(): boolean {
    if (!this.isLive) return false;
    return new Date() >= this.endTime;
  }

  @ApiProperty({ description: 'Time remaining in seconds' })
  get timeRemaining(): number {
    if (!this.isLive) return 0;
    const remaining = this.endTime.getTime() - new Date().getTime();
    return Math.max(0, Math.floor(remaining / 1000));
  }

  @ApiProperty({ description: 'Next minimum bid amount' })
  get nextMinBid(): number {
    if (!this.currentBid) return this.startingBid;
    return this.currentBid + this.minBidIncrement;
  }
}
