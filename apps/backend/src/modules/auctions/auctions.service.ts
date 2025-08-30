import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Auction, AuctionStatus, AuctionType } from './entities/auction.entity';
import { Bid, BidStatus } from './entities/bid.entity';
import { CreateAuctionDto } from './dto/create-auction.dto';
import { PlaceBidDto } from './dto/place-bid.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { Listing } from '../listings/entities/listing.entity';
import { EscrowHold, EscrowStatus } from '../escrow/entities/escrow-hold.entity';

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class AuctionsService {
  @WebSocketServer()
  server: Server;

  constructor(
    @InjectRepository(Auction)
    private auctionRepository: Repository<Auction>,
    @InjectRepository(Bid)
    private bidRepository: Repository<Bid>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Listing)
    private listingRepository: Repository<Listing>,
    @InjectRepository(EscrowHold)
    private escrowHoldRepository: Repository<EscrowHold>,
    private dataSource: DataSource,
  ) {}

  async createAuction(createAuctionDto: CreateAuctionDto, farmerId: string): Promise<Auction> {
    // Verify farmer exists and can create auctions
    const farmer = await this.userRepository.findOne({
      where: { id: farmerId, role: UserRole.FARMER },
    });
    if (!farmer) {
      throw new ForbiddenException('Only farmers can create auctions');
    }

    // Verify listing exists and belongs to farmer
    const listing = await this.listingRepository.findOne({
      where: { id: createAuctionDto.listingId, farmerId },
    });
    if (!listing) {
      throw new NotFoundException('Listing not found or does not belong to you');
    }

    // Check if listing already has an active auction
    const existingAuction = await this.auctionRepository.findOne({
      where: { listingId: createAuctionDto.listingId, status: AuctionStatus.SCHEDULED },
    });
    if (existingAuction) {
      throw new BadRequestException('Listing already has a scheduled auction');
    }

    // Validate auction timing
    const startTime = new Date(createAuctionDto.startTime);
    const endTime = new Date(createAuctionDto.endTime);
    const now = new Date();

    if (startTime <= now) {
      throw new BadRequestException('Auction start time must be in the future');
    }

    if (endTime <= startTime) {
      throw new BadRequestException('Auction end time must be after start time');
    }

    if (endTime.getTime() - startTime.getTime() < 5 * 60 * 1000) {
      throw new BadRequestException('Auction must run for at least 5 minutes');
    }

    // Create auction
    const auction = this.auctionRepository.create({
      ...createAuctionDto,
      farmerId,
      startTime,
      endTime,
      minBidIncrement: createAuctionDto.minBidIncrement || 1.0,
      antiSnipingBuffer: createAuctionDto.antiSnipingBuffer || 30,
    });

    return this.auctionRepository.save(auction);
  }

  async placeBid(placeBidDto: PlaceBidDto, bidderId: string): Promise<Bid> {
    // Verify auction exists and is live
    const auction = await this.auctionRepository.findOne({
      where: { id: placeBidDto.auctionId },
      relations: ['listing'],
    });
    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    if (auction.status !== AuctionStatus.LIVE) {
      throw new BadRequestException('Auction is not live');
    }

    // Verify bidder exists and can participate
    const bidder = await this.userRepository.findOne({
      where: { id: bidderId },
    });
    if (!bidder || !bidder.canParticipateInAuctions) {
      throw new ForbiddenException('You cannot participate in this auction');
    }

    // Verify bidder is not the farmer
    if (bidderId === auction.farmerId) {
      throw new ForbiddenException('Farmers cannot bid on their own auctions');
    }

    // Validate bid amount
    const minBid = auction.nextMinBid;
    if (placeBidDto.amount < minBid) {
      throw new BadRequestException(`Bid must be at least ₹${minBid.toFixed(2)}`);
    }

    // Check if bidder has sufficient escrow for 10% deposit
    const escrowAmount = (placeBidDto.amount * auction.listing.quantity * auction.listing.pricePerUnit) * 0.1;
    const activeEscrow = await this.escrowHoldRepository.findOne({
      where: {
        buyerId: bidderId,
        listingId: auction.listingId,
        status: EscrowStatus.HELD,
      },
    });

    if (!activeEscrow || activeEscrow.amount < escrowAmount) {
      throw new BadRequestException('Insufficient escrow deposit. Please deposit 10% before bidding.');
    }

    // Use transaction to ensure data consistency
    return this.dataSource.transaction(async (manager) => {
      // Update previous winning bid status
      if (auction.winningBidId) {
        await manager.update(Bid, auction.winningBidId, { status: BidStatus.OUTBID });
      }

      // Create new bid
      const bid = manager.create(Bid, {
        auctionId: placeBidDto.auctionId,
        bidderId,
        amount: placeBidDto.amount,
        isAutoBid: placeBidDto.isAutoBid || false,
        maxAutoBidAmount: placeBidDto.maxAutoBidAmount,
        ipAddress: '', // Will be set by interceptor
        userAgent: '', // Will be set by interceptor
      });

      const savedBid = await manager.save(Bid, bid);

      // Update auction with new winning bid
      await manager.update(Auction, auction.id, {
        currentBid: placeBidDto.amount,
        winningBidId: savedBid.id,
        winningBidderId: bidderId,
        winningBidAmount: placeBidDto.amount,
        totalBids: auction.totalBids + 1,
        uniqueBidders: auction.uniqueBidders + (auction.winningBidId ? 0 : 1),
      });

      // Emit real-time updates
      this.server.to(`auction_${auction.id}`).emit('bid_placed', {
        auctionId: auction.id,
        bid: {
          id: savedBid.id,
          amount: savedBid.amount,
          bidderId: savedBid.bidderId,
          createdAt: savedBid.createdAt,
        },
        currentBid: placeBidDto.amount,
        nextMinBid: placeBidDto.amount + auction.minBidIncrement,
      });

      return savedBid;
    });
  }

  async startAuction(auctionId: string, farmerId: string): Promise<Auction> {
    const auction = await this.auctionRepository.findOne({
      where: { id: auctionId, farmerId },
    });

    if (!auction) {
      throw new NotFoundException('Auction not found or does not belong to you');
    }

    if (auction.status !== AuctionStatus.SCHEDULED) {
      throw new BadRequestException('Auction cannot be started');
    }

    if (!auction.canStart) {
      throw new BadRequestException('Auction start time has not been reached');
    }

    // Start auction
    auction.status = AuctionStatus.LIVE;
    auction.actualStartTime = new Date();

    const updatedAuction = await this.auctionRepository.save(auction);

    // Emit auction started event
    this.server.to(`auction_${auction.id}`).emit('auction_started', {
      auctionId: auction.id,
      startTime: auction.actualStartTime,
      endTime: auction.endTime,
    });

    return updatedAuction;
  }

  async endAuction(auctionId: string, farmerId: string): Promise<Auction> {
    const auction = await this.auctionRepository.findOne({
      where: { id: auctionId, farmerId },
      relations: ['bids'],
    });

    if (!auction) {
      throw new NotFoundException('Auction not found or does not belong to you');
    }

    if (auction.status !== AuctionStatus.LIVE) {
      throw new BadRequestException('Auction is not live');
    }

    // End auction
    auction.status = AuctionStatus.ENDED;
    auction.actualEndTime = new Date();
    auction.isEnded = true;

    // Check if reserve price was met
    if (auction.reservePrice && auction.currentBid >= auction.reservePrice) {
      auction.reserveMet = true;
    }

    const updatedAuction = await this.auctionRepository.save(auction);

    // Emit auction ended event
    this.server.to(`auction_${auction.id}`).emit('auction_ended', {
      auctionId: auction.id,
      endTime: auction.actualEndTime,
      winningBid: auction.winningBidId ? {
        id: auction.winningBidId,
        bidderId: auction.winningBidderId,
        amount: auction.winningBidAmount,
      } : null,
      reserveMet: auction.reserveMet,
    });

    return updatedAuction;
  }

  async getAuction(auctionId: string): Promise<Auction> {
    const auction = await this.auctionRepository.findOne({
      where: { id: auctionId },
      relations: ['listing', 'farmer', 'bids', 'bids.bidder'],
    });

    if (!auction) {
      throw new NotFoundException('Auction not found');
    }

    return auction;
  }

  async getLiveAuctions(): Promise<Auction[]> {
    return this.auctionRepository.find({
      where: { status: AuctionStatus.LIVE },
      relations: ['listing', 'farmer'],
      order: { endTime: 'ASC' },
    });
  }

  async getScheduledAuctions(): Promise<Auction[]> {
    return this.auctionRepository.find({
      where: { status: AuctionStatus.SCHEDULED },
      relations: ['listing', 'farmer'],
      order: { startTime: 'ASC' },
    });
  }

  async getUserBids(userId: string): Promise<Bid[]> {
    return this.bidRepository.find({
      where: { bidderId: userId },
      relations: ['auction', 'auction.listing'],
      order: { createdAt: 'DESC' },
    });
  }

  async getUserAuctions(userId: string): Promise<Auction[]> {
    return this.auctionRepository.find({
      where: { farmerId: userId },
      relations: ['listing', 'bids'],
      order: { createdAt: 'DESC' },
    });
  }

  // Auto-bidding logic
  async processAutoBids(auctionId: string): Promise<void> {
    const auction = await this.auctionRepository.findOne({
      where: { id: auctionId, status: AuctionStatus.LIVE },
      relations: ['bids'],
    });

    if (!auction) return;

    const activeBids = auction.bids.filter(bid => 
      bid.isAutoBid && 
      bid.status === BidStatus.ACTIVE && 
      bid.maxAutoBidAmount > auction.currentBid
    );

    for (const bid of activeBids) {
      const nextBidAmount = auction.currentBid + auction.minBidIncrement;
      
      if (nextBidAmount <= bid.maxAutoBidAmount) {
        // Place auto-bid
        await this.placeBid({
          auctionId,
          amount: nextBidAmount,
          isAutoBid: true,
          maxAutoBidAmount: bid.maxAutoBidAmount,
        }, bid.bidderId);
      }
    }
  }

  // Anti-sniping logic
  async extendAuctionIfNeeded(auctionId: string): Promise<void> {
    const auction = await this.auctionRepository.findOne({
      where: { id: auctionId, status: AuctionStatus.LIVE },
    });

    if (!auction) return;

    const timeRemaining = auction.timeRemaining;
    
    if (timeRemaining <= auction.antiSnipingBuffer) {
      // Extend auction by anti-sniping buffer
      const newEndTime = new Date(auction.endTime.getTime() + (auction.antiSnipingBuffer * 1000));
      
      await this.auctionRepository.update(auction.id, { endTime: newEndTime });

      // Emit extension event
      this.server.to(`auction_${auction.id}`).emit('auction_extended', {
        auctionId: auction.id,
        newEndTime,
        reason: 'Anti-sniping protection activated',
      });
    }
  }

  // Scheduled tasks
  @Cron(CronExpression.EVERY_MINUTE)
  async processScheduledAuctions(): Promise<void> {
    const scheduledAuctions = await this.auctionRepository.find({
      where: { status: AuctionStatus.SCHEDULED },
    });

    for (const auction of scheduledAuctions) {
      if (auction.canStart) {
        await this.startAuction(auction.id, auction.farmerId);
      }
    }
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async processLiveAuctions(): Promise<void> {
    const liveAuctions = await this.auctionRepository.find({
      where: { status: AuctionStatus.LIVE },
    });

    for (const auction of liveAuctions) {
      if (auction.shouldEnd) {
        await this.endAuction(auction.id, auction.farmerId);
      } else {
        // Process auto-bids and anti-sniping
        await this.processAutoBids(auction.id);
        await this.extendAuctionIfNeeded(auction.id);
      }
    }
  }

  // WebSocket room management
  async joinAuctionRoom(auctionId: string, userId: string): Promise<void> {
    // Verify user can access auction
    const auction = await this.getAuction(auctionId);
    if (!auction) return;

    // Join room for real-time updates
    this.server.sockets.sockets.forEach((socket) => {
      if (socket.data.userId === userId) {
        socket.join(`auction_${auctionId}`);
      }
    });
  }

  async leaveAuctionRoom(auctionId: string, userId: string): Promise<void> {
    this.server.sockets.sockets.forEach((socket) => {
      if (socket.data.userId === userId) {
        socket.leave(`auction_${auctionId}`);
      }
    });
  }
}
