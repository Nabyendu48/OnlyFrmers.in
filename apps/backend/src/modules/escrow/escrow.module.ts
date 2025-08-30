import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EscrowHold } from './entities/escrow-hold.entity';
import { User } from '../users/entities/user.entity';
import { Listing } from '../listings/entities/listing.entity';
import { Auction } from '../auctions/entities/auction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([EscrowHold, User, Listing, Auction]),
  ],
  exports: [TypeOrmModule],
})
export class EscrowModule {}
