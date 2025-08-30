import { Injectable, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import Razorpay from 'razorpay';
import { Payment, PaymentStatus, PaymentType, PaymentGateway } from './entities/payment.entity';
import { EscrowHold, EscrowStatus, EscrowType } from '../escrow/entities/escrow-hold.entity';
import { CreatePaymentIntentDto } from './dto/create-payment-intent.dto';
import { User } from '../users/entities/user.entity';
import { Listing } from '../listings/entities/listing.entity';
import { Auction } from '../auctions/entities/auction.entity';

@Injectable()
export class PaymentsService {
  private razorpay: Razorpay;

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(EscrowHold)
    private escrowHoldRepository: Repository<EscrowHold>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Listing)
    private listingRepository: Repository<Listing>,
    @InjectRepository(Auction)
    private auctionRepository: Repository<Auction>,
    private configService: ConfigService,
    private dataSource: DataSource,
  ) {
    // Initialize Razorpay
    this.razorpay = new Razorpay({
      key_id: this.configService.get<string>('RAZORPAY_KEY_ID'),
      key_secret: this.configService.get<string>('RAZORPAY_KEY_SECRET'),
    });
  }

  async createPaymentIntent(createPaymentIntentDto: CreatePaymentIntentDto): Promise<{
    paymentIntentId: string;
    clientSecret: string;
    orderId: string;
    amount: number;
    currency: string;
  }> {
    const { userId, listingId, auctionId, escrowHoldId, type, amount, currency, paymentGateway } = createPaymentIntentDto;

    // Verify user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Verify listing exists
    const listing = await this.listingRepository.findOne({ where: { id: listingId } });
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    // Verify auction exists if provided
    if (auctionId) {
      const auction = await this.auctionRepository.findOne({ where: { id: auctionId } });
      if (!auction) {
        throw new NotFoundException('Auction not found');
      }
    }

    // Verify escrow hold exists if provided
    if (escrowHoldId) {
      const escrowHold = await this.escrowHoldRepository.findOne({ where: { id: escrowHoldId } });
      if (!escrowHold) {
        throw new NotFoundException('Escrow hold not found');
      }
    }

    // Validate payment amount
    if (amount <= 0) {
      throw new BadRequestException('Payment amount must be greater than 0');
    }

    try {
      let orderId: string;
      let paymentIntentId: string;

      if (paymentGateway === PaymentGateway.RAZORPAY) {
        // Create Razorpay order
        const razorpayOrder = await this.razorpay.orders.create({
          amount: Math.round(amount * 100), // Convert to paise
          currency: currency || 'INR',
          receipt: `payment_${Date.now()}`,
          notes: {
            userId,
            listingId,
            auctionId: auctionId || '',
            type,
            description: createPaymentIntentDto.description || '',
          },
        });

        orderId = razorpayOrder.id;
        paymentIntentId = razorpayOrder.id; // Razorpay uses order ID as payment intent ID
      } else {
        throw new BadRequestException('Unsupported payment gateway');
      }

      // Create payment record
      const payment = this.paymentRepository.create({
        userId,
        listingId,
        auctionId,
        escrowHoldId,
        type,
        amount,
        currency: currency || 'INR',
        paymentGateway,
        gatewayPaymentIntentId: paymentIntentId,
        gatewayOrderId: orderId,
        description: createPaymentIntentDto.description,
        metadata: createPaymentIntentDto.metadata,
        status: PaymentStatus.PENDING,
      });

      await this.paymentRepository.save(payment);

      return {
        paymentIntentId,
        clientSecret: orderId, // For Razorpay, we use order ID as client secret
        orderId,
        amount,
        currency: currency || 'INR',
      };
    } catch (error) {
      throw new InternalServerErrorException(`Failed to create payment intent: ${error.message}`);
    }
  }

  async processPaymentSuccess(
    paymentIntentId: string,
    transactionId: string,
    paymentMethod: string,
    gatewayResponse: any,
  ): Promise<Payment> {
    // Find payment by payment intent ID
    const payment = await this.paymentRepository.findOne({
      where: { gatewayPaymentIntentId: paymentIntentId },
      relations: ['escrowHold'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      throw new BadRequestException('Payment already processed');
    }

    try {
      // Verify payment with Razorpay
      if (payment.paymentGateway === PaymentGateway.RAZORPAY) {
        const razorpayPayment = await this.razorpay.payments.fetch(transactionId);
        
        if (razorpayPayment.status !== 'captured') {
          throw new BadRequestException('Payment not captured by Razorpay');
        }

        if (razorpayPayment.amount !== Math.round(payment.amount * 100)) {
          throw new BadRequestException('Payment amount mismatch');
        }
      }

      // Update payment status
      payment.status = PaymentStatus.COMPLETED;
      payment.gatewayTransactionId = transactionId;
      payment.paymentMethod = paymentMethod;
      payment.gatewayResponse = gatewayResponse;
      payment.processedAt = new Date();

      const updatedPayment = await this.paymentRepository.save(payment);

      // Handle escrow hold if this is an escrow deposit
      if (payment.type === PaymentType.ESCROW_DEPOSIT && payment.escrowHoldId) {
        await this.updateEscrowHoldStatus(payment.escrowHoldId, EscrowStatus.HELD);
      }

      return updatedPayment;
    } catch (error) {
      // Mark payment as failed
      payment.status = PaymentStatus.FAILED;
      payment.errorMessage = error.message;
      payment.errorCode = 'VERIFICATION_FAILED';
      await this.paymentRepository.save(payment);

      throw new InternalServerErrorException(`Payment verification failed: ${error.message}`);
    }
  }

  async processPaymentFailure(
    paymentIntentId: string,
    errorCode: string,
    errorMessage: string,
  ): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { gatewayPaymentIntentId: paymentIntentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    payment.status = PaymentStatus.FAILED;
    payment.errorCode = errorCode;
    payment.errorMessage = errorMessage;

    return this.paymentRepository.save(payment);
  }

  async createEscrowHold(
    buyerId: string,
    listingId: string,
    auctionId: string | null,
    amount: number,
    totalAmount: number,
  ): Promise<EscrowHold> {
    // Calculate escrow amount (10% of total)
    const escrowAmount = totalAmount * 0.1;

    // Create escrow hold
    const escrowHold = this.escrowHoldRepository.create({
      buyerId,
      listingId,
      auctionId,
      type: EscrowType.AUCTION_DEPOSIT,
      amount: escrowAmount,
      totalAmount,
      status: EscrowStatus.PENDING,
      expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      reason: '10% deposit required for auction participation',
      metadata: {
        originalAmount: amount,
        escrowPercentage: 10,
      },
    });

    return this.escrowHoldRepository.save(escrowHold);
  }

  async releaseEscrowHold(escrowHoldId: string, reason: string): Promise<EscrowHold> {
    const escrowHold = await this.escrowHoldRepository.findOne({
      where: { id: escrowHoldId },
    });

    if (!escrowHold) {
      throw new NotFoundException('Escrow hold not found');
    }

    if (escrowHold.status !== EscrowStatus.HELD) {
      throw new BadRequestException('Escrow hold is not active');
    }

    escrowHold.status = EscrowStatus.RELEASED;
    escrowHold.releasedAt = new Date();
    escrowHold.reason = reason;

    return this.escrowHoldRepository.save(escrowHold);
  }

  async refundEscrowHold(escrowHoldId: string, reason: string): Promise<EscrowHold> {
    const escrowHold = await this.escrowHoldRepository.findOne({
      where: { id: escrowHoldId },
      relations: ['payments'],
    });

    if (!escrowHold) {
      throw new NotFoundException('Escrow hold not found');
    }

    if (escrowHold.status !== EscrowStatus.HELD) {
      throw new BadRequestException('Escrow hold is not active');
    }

    try {
      // Process refund through payment gateway
      if (escrowHold.payments && escrowHold.payments.length > 0) {
        const payment = escrowHold.payments[0];
        
        if (payment.paymentGateway === PaymentGateway.RAZORPAY && payment.gatewayTransactionId) {
          // Create Razorpay refund
          const refund = await this.razorpay.payments.refund(payment.gatewayTransactionId, {
            amount: Math.round(escrowHold.amount * 100), // Convert to paise
            notes: {
              reason,
              escrowHoldId,
            },
          });

          // Update payment with refund information
          payment.status = PaymentStatus.REFUNDED;
          payment.refundAmount = escrowHold.amount;
          payment.refundReason = reason;
          payment.refundedAt = new Date();
          await this.paymentRepository.save(payment);
        }
      }

      // Update escrow hold status
      escrowHold.status = EscrowStatus.REFUNDED;
      escrowHold.refundedAt = new Date();
      escrowHold.reason = reason;

      return this.escrowHoldRepository.save(escrowHold);
    } catch (error) {
      throw new InternalServerErrorException(`Failed to process refund: ${error.message}`);
    }
  }

  async getPayment(paymentId: string): Promise<Payment> {
    const payment = await this.paymentRepository.findOne({
      where: { id: paymentId },
      relations: ['user', 'listing', 'auction', 'escrowHold'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  async getUserPayments(userId: string): Promise<Payment[]> {
    return this.paymentRepository.find({
      where: { userId },
      relations: ['listing', 'auction'],
      order: { createdAt: 'DESC' },
    });
  }

  async getEscrowHold(escrowHoldId: string): Promise<EscrowHold> {
    const escrowHold = await this.escrowHoldRepository.findOne({
      where: { id: escrowHoldId },
      relations: ['buyer', 'listing', 'auction', 'payments'],
    });

    if (!escrowHold) {
      throw new NotFoundException('Escrow hold not found');
    }

    return escrowHold;
  }

  async getUserEscrowHolds(userId: string): Promise<EscrowHold[]> {
    return this.escrowHoldRepository.find({
      where: { buyerId: userId },
      relations: ['listing', 'auction'],
      order: { createdAt: 'DESC' },
    });
  }

  private async updateEscrowHoldStatus(escrowHoldId: string, status: EscrowStatus): Promise<void> {
    await this.escrowHoldRepository.update(escrowHoldId, {
      status,
      heldAt: status === EscrowStatus.HELD ? new Date() : undefined,
    });
  }

  // Webhook verification for Razorpay
  async verifyRazorpayWebhook(
    body: any,
    signature: string,
    webhookSecret: string,
  ): Promise<boolean> {
    try {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(JSON.stringify(body))
        .digest('hex');

      return expectedSignature === signature;
    } catch (error) {
      return false;
    }
  }

  // Get payment gateway configuration
  getPaymentGatewayConfig(gateway: PaymentGateway): any {
    switch (gateway) {
      case PaymentGateway.RAZORPAY:
        return {
          keyId: this.configService.get<string>('RAZORPAY_KEY_ID'),
          currency: 'INR',
          name: 'OnlyFarmers.in',
          description: 'Farm produce marketplace',
          prefill: {
            name: '',
            email: '',
            contact: '',
          },
          theme: {
            color: '#10B981',
          },
        };
      default:
        throw new BadRequestException('Unsupported payment gateway');
    }
  }
}
