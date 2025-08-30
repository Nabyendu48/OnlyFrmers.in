import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-intent')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a payment intent for escrow or final payment' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Payment intent created successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid payment data',
  })
  async createPaymentIntent(
    @Body() createPaymentIntentDto: CreatePaymentIntentDto,
    @Request() req,
  ) {
    // Verify user is making payment for themselves
    if (createPaymentIntentDto.userId !== req.user.id) {
      throw new Error('Cannot create payment intent for another user');
    }

    const paymentIntent = await this.paymentsService.createPaymentIntent(
      createPaymentIntentDto,
    );
    
    return {
      success: true,
      message: 'Payment intent created successfully',
      data: paymentIntent,
    };
  }

  @Post('verify')
  @ApiOperation({ summary: 'Verify payment completion (webhook)' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment verified successfully',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Payment verification failed',
  })
  async verifyPayment(
    @Body() body: {
      paymentIntentId: string;
      transactionId: string;
      paymentMethod: string;
      gatewayResponse: any;
    },
  ) {
    const payment = await this.paymentsService.processPaymentSuccess(
      body.paymentIntentId,
      body.transactionId,
      body.paymentMethod,
      body.gatewayResponse,
    );
    
    return {
      success: true,
      message: 'Payment verified successfully',
      data: payment,
    };
  }

  @Post('webhook/razorpay')
  @ApiOperation({ summary: 'Razorpay webhook endpoint' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Webhook processed successfully',
  })
  async razorpayWebhook(
    @Body() body: any,
    @Request() req,
  ) {
    // Verify webhook signature
    const signature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    
    if (!webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    const isValid = await this.paymentsService.verifyRazorpayWebhook(
      body,
      signature,
      webhookSecret,
    );

    if (!isValid) {
      throw new Error('Invalid webhook signature');
    }

    // Process webhook based on event type
    const event = body.event;
    
    switch (event) {
      case 'payment.captured':
        await this.paymentsService.processPaymentSuccess(
          body.payload.payment.entity.order_id,
          body.payload.payment.entity.id,
          'razorpay',
          body.payload,
        );
        break;
      
      case 'payment.failed':
        await this.paymentsService.processPaymentFailure(
          body.payload.payment.entity.order_id,
          'PAYMENT_FAILED',
          body.payload.payment.entity.error_description || 'Payment failed',
        );
        break;
      
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    return { success: true, message: 'Webhook processed' };
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user payment history' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User payments retrieved successfully',
  })
  async getUserPayments(
    @Param('userId') userId: string,
    @Request() req,
  ) {
    // Verify user can only access their own payments
    if (req.user.id !== userId && req.user.role !== UserRole.ADMIN) {
      throw new Error('Cannot access other user payments');
    }

    const payments = await this.paymentsService.getUserPayments(userId);
    
    return {
      success: true,
      data: payments,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get payment by ID' })
  @ApiParam({ name: 'id', description: 'Payment ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Payment retrieved successfully',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Payment not found',
  })
  async getPayment(
    @Param('id') id: string,
    @Request() req,
  ) {
    const payment = await this.paymentsService.getPayment(id);
    
    // Verify user can access this payment
    if (payment.userId !== req.user.id && req.user.role !== UserRole.ADMIN) {
      throw new Error('Cannot access this payment');
    }
    
    return {
      success: true,
      data: payment,
    };
  }

  @Get('gateway-config/:gateway')
  @ApiOperation({ summary: 'Get payment gateway configuration' })
  @ApiParam({ name: 'gateway', description: 'Payment gateway name' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Gateway configuration retrieved successfully',
  })
  async getGatewayConfig(@Param('gateway') gateway: string) {
    const config = this.paymentsService.getPaymentGatewayConfig(gateway);
    
    return {
      success: true,
      data: config,
    };
  }
}

@ApiTags('escrow')
@Controller('escrow')
export class EscrowController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create escrow hold for auction participation' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Escrow hold created successfully',
  })
  async createEscrowHold(
    @Body() body: {
      listingId: string;
      auctionId?: string;
      amount: number;
      totalAmount: number;
    },
    @Request() req,
  ) {
    const escrowHold = await this.paymentsService.createEscrowHold(
      req.user.id,
      body.listingId,
      body.auctionId,
      body.amount,
      body.totalAmount,
    );
    
    return {
      success: true,
      message: 'Escrow hold created successfully',
      data: escrowHold,
    };
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user escrow holds' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User escrow holds retrieved successfully',
  })
  async getUserEscrowHolds(
    @Param('userId') userId: string,
    @Request() req,
  ) {
    // Verify user can only access their own escrow holds
    if (req.user.id !== userId && req.user.role !== UserRole.ADMIN) {
      throw new Error('Cannot access other user escrow holds');
    }

    const escrowHolds = await this.paymentsService.getUserEscrowHolds(userId);
    
    return {
      success: true,
      data: escrowHolds,
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get escrow hold by ID' })
  @ApiParam({ name: 'id', description: 'Escrow hold ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Escrow hold retrieved successfully',
  })
  async getEscrowHold(
    @Param('id') id: string,
    @Request() req,
  ) {
    const escrowHold = await this.paymentsService.getEscrowHold(id);
    
    // Verify user can access this escrow hold
    if (escrowHold.buyerId !== req.user.id && req.user.role !== UserRole.ADMIN) {
      throw new Error('Cannot access this escrow hold');
    }
    
    return {
      success: true,
      data: escrowHold,
    };
  }

  @Put(':id/release')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Release escrow hold (admin only)' })
  @ApiParam({ name: 'id', description: 'Escrow hold ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Escrow hold released successfully',
  })
  async releaseEscrowHold(
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    const escrowHold = await this.paymentsService.releaseEscrowHold(
      id,
      body.reason,
    );
    
    return {
      success: true,
      message: 'Escrow hold released successfully',
      data: escrowHold,
    };
  }

  @Put(':id/refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Refund escrow hold (admin only)' })
  @ApiParam({ name: 'id', description: 'Escrow hold ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Escrow hold refunded successfully',
  })
  async refundEscrowHold(
    @Param('id') id: string,
    @Body() body: { reason: string },
  ) {
    const escrowHold = await this.paymentsService.refundEscrowHold(
      id,
      body.reason,
    );
    
    return {
      success: true,
      message: 'Escrow hold refunded successfully',
      data: escrowHold,
    };
  }
}
