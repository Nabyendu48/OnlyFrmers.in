import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuctionsController } from './auctions.controller';
import { AuctionsService } from './auctions.service';
import { Auction } from './entities/auction.entity';
import { Bid } from './entities/bid.entity';
import { User } from '../users/entities/user.entity';
import { Listing } from '../listings/entities/listing.entity';
import { EscrowHold } from '../escrow/entities/escrow-hold.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Auction, Bid, User, Listing, EscrowHold]),
    ScheduleModule.forRoot(),
  ],
  controllers: [AuctionsController],
  providers: [AuctionsService],
  exports: [AuctionsService],
})
export class AuctionsModule {}
