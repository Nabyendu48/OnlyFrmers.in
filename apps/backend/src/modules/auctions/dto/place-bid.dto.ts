import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsOptional, IsBoolean, Min, Max } from 'class-validator';

export class PlaceBidDto {
  @ApiProperty({ description: 'Auction ID to bid on' })
  @IsUUID()
  auctionId: string;

  @ApiProperty({ description: 'Bid amount' })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: 'Whether this is an auto-bid', required: false })
  @IsOptional()
  @IsBoolean()
  isAutoBid?: boolean;

  @ApiProperty({ description: 'Maximum auto-bid amount', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0.01)
  maxAutoBidAmount?: number;
}
