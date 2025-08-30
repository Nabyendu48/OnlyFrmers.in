import { ApiProperty } from '@nestjs/swagger';
import { IsUUID, IsNumber, IsEnum, IsOptional, IsString, Min, IsObject } from 'class-validator';
import { PaymentType, PaymentGateway } from '../entities/payment.entity';

export class CreatePaymentIntentDto {
  @ApiProperty({ description: 'User ID making the payment' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'Listing ID for the transaction' })
  @IsUUID()
  listingId: string;

  @ApiProperty({ description: 'Auction ID (if applicable)', required: false })
  @IsOptional()
  @IsUUID()
  auctionId?: string;

  @ApiProperty({ description: 'Escrow hold ID (if applicable)', required: false })
  @IsOptional()
  @IsUUID()
  escrowHoldId?: string;

  @ApiProperty({ description: 'Type of payment', enum: PaymentType })
  @IsEnum(PaymentType)
  type: PaymentType;

  @ApiProperty({ description: 'Payment amount' })
  @IsNumber()
  @Min(0.01)
  amount: number;

  @ApiProperty({ description: 'Currency code', default: 'INR' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Payment gateway to use', enum: PaymentGateway })
  @IsEnum(PaymentGateway)
  paymentGateway: PaymentGateway;

  @ApiProperty({ description: 'Payment description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Additional metadata', required: false })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
