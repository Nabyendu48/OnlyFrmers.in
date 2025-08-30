import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController, EscrowController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { Payment } from './entities/payment.entity';
import { EscrowHold } from '../escrow/entities/escrow-hold.entity';
import { User } from '../users/entities/user.entity';
import { Listing } from '../listings/entities/listing.entity';
import { Auction } from '../auctions/entities/auction.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Payment, EscrowHold, User, Listing, Auction]),
    ConfigModule,
  ],
  controllers: [PaymentsController, EscrowController],
  providers: [PaymentsService],
  exports: [PaymentsService],
})
export class PaymentsModule {}
