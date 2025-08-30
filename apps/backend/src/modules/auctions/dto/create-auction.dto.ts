import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsEnum, IsDateString, IsNumber, IsOptional, Min, Max, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { AuctionType } from '../entities/auction.entity';

export class CreateAuctionDto {
  @ApiProperty({ description: 'Associated listing ID' })
  @IsUUID()
  listingId: string;

  @ApiProperty({ description: 'Auction type', enum: AuctionType })
  @IsEnum(AuctionType)
  type: AuctionType;

  @ApiProperty({ description: 'Scheduled start time (ISO string)' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ description: 'Scheduled end time (ISO string)' })
  @IsDateString()
  endTime: string;

  @ApiProperty({ description: 'Starting bid amount' })
  @IsNumber()
  @Min(0.01)
  startingBid: number;

  @ApiProperty({ description: 'Reserve price (minimum acceptable price)', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  reservePrice?: number;

  @ApiProperty({ description: 'Minimum bid increment', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  minBidIncrement?: number;

  @ApiProperty({ description: 'Anti-sniping buffer time in seconds', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(300)
  antiSnipingBuffer?: number;
}
