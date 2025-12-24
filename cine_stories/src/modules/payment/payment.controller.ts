import { Body, Controller, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Payment } from '../../infrastructure/database/entities/payment.entity';
import { CartItem } from '../../infrastructure/database/entities/cart.entity';
import { AdminGuard } from '../auth/guards/admin.guard';
import { PaymentService } from './payment.service';
import { InvoiceService } from './invoice.service';
import { AnalyticsService } from '../analytics/analytics.service';
import { AnalyticsEventType } from '../../infrastructure/database/entities/analytics.entity';

@Controller('payments')
export class PaymentController {
  constructor(
    private readonly payments: PaymentService,
    private readonly invoice: InvoiceService,
    private readonly analytics: AnalyticsService,
    @InjectRepository(Payment) private readonly paymentRepo: Repository<Payment>,
    @InjectRepository(CartItem) private readonly cartItemRepo: Repository<CartItem>,
  ) {}

  // Guest checkout - no auth required
  @Post('order')
  async create(
    @Req() req: any,
    @Body() body: { amount: number; currency?: string; customerDetails?: any },
  ) {
    // Get user ID from auth token or guest user
    const userId = req.user?.userId || await this.getOrCreateGuestUser(req);
    
    // Track checkout start
    await this.analytics.trackEvent(
      AnalyticsEventType.CHECKOUT_START,
      userId,
      { amount: body.amount, currency: body.currency },
      req.cookies?.guestUserId || req.session?.guestUserId,
      req.headers['user-agent'],
      req.ip,
    );
    
    const result = await this.payments.createOrder(userId, body.amount, body.currency, body.customerDetails);
    
    // Track payment initiated
    await this.analytics.trackEvent(
      AnalyticsEventType.PAYMENT_INITIATED,
      userId,
      { orderId: result.orderId, amount: body.amount },
      req.cookies?.guestUserId || req.session?.guestUserId,
      req.headers['user-agent'],
      req.ip,
    );
    
    return result;
  }

  // Helper: Get or create guest user for anonymous checkout
  private async getOrCreateGuestUser(req: any): Promise<string> {
    // Check if we have a guest user ID in cookie
    const guestId = req.cookies?.guestUserId;
    if (guestId) {
      return guestId;
    }
    
    // Create a new guest user
    const guestUser = await this.payments.createGuestUser();
    
    // Set cookie for future requests
    if (req.res) {
      req.res.cookie('guestUserId', guestUser.id, {
        httpOnly: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: 'lax',
      });
    }
    
    return guestUser.id;
  }

  // Razorpay sends fields: razorpay_order_id, razorpay_payment_id, razorpay_signature
  @Post('verify')
  async verify(
    @Body()
    body:
      | { orderId: string; paymentId: string; signature: string }
      | {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        },
  ) {
    const isRazorPayload = (b: any): b is {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    } =>
      !!b &&
      typeof b.razorpay_order_id === 'string' &&
      typeof b.razorpay_payment_id === 'string' &&
      typeof b.razorpay_signature === 'string';

    const payload = isRazorPayload(body)
      ? {
          orderId: body.razorpay_order_id,
          paymentId: body.razorpay_payment_id,
          signature: body.razorpay_signature,
        }
      : (body as { orderId: string; paymentId: string; signature: string });

    const verified = await this.payments.verifySignature(payload);
    
    // Track payment result
    const payment = await this.paymentRepo.findOne({
      where: { referenceId: payload.orderId },
      relations: ['user'],
    });
    
    if (payment && payment.user) {
      await this.analytics.trackEvent(
        verified ? AnalyticsEventType.PAYMENT_SUCCESS : AnalyticsEventType.PAYMENT_FAILED,
        payment.user.id,
        { orderId: payload.orderId, paymentId: payload.paymentId },
        undefined,
        undefined,
        undefined,
      );
    }
    
    return { verified, success: verified };
  }

  // Get invoice for a payment
  @Get('invoice/:orderId')
  async getInvoice(@Req() req: any, @Param('orderId') orderId: string, @Res() res: Response) {
    const userId = req.user?.userId || req.cookies?.guestUserId;
    if (!userId) {
      return res.status(401).json({ error: 'User not found' });
    }

    const payment = await this.paymentRepo.findOne({
      where: { referenceId: orderId },
      relations: ['user'],
    });

    if (!payment || payment.user.id !== userId) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Get cart items from payment payload (stored before clearing cart)
    const cartItems = (payment.payload as any)?.cartItems || [];

    const invoiceBuffer = await this.invoice.generateInvoiceBuffer(
      payment,
      cartItems,
      payment.user,
    );

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=invoice-${orderId}.pdf`);
    return res.send(invoiceBuffer);
  }

  // Refund payment (Admin only)
  @UseGuards(AdminGuard)
  @Post('refund/:paymentId')
  async refund(
    @Param('paymentId') paymentId: string,
    @Body() body: { amount?: number; notes?: string },
  ) {
    return this.payments.refundPayment(paymentId, body.amount, body.notes);
  }

  // Get all payments (Admin only)
  @UseGuards(AdminGuard)
  @Get()
  async findAll(@Query('status') status?: string, @Query('limit') limit?: number) {
    const query = this.paymentRepo.createQueryBuilder('payment')
      .leftJoinAndSelect('payment.user', 'user')
      .orderBy('payment.createdAt', 'DESC');

    if (status) {
      query.where('payment.status = :status', { status });
    }

    if (limit) {
      query.take(limit);
    }

    const payments = await query.getMany();
    
    return payments.map(payment => {
      const payload = payment.payload as any;
      return {
        id: payment.id,
        amount: payload?.amount ? payload.amount / 100 : 0, // Convert from paise
        currency: payload?.currency || 'INR',
        status: payment.status,
        createdAt: payment.createdAt,
        orderId: payment.referenceId,
        userId: payment.user?.id,
        userEmail: payment.user?.email,
        userName: payment.user?.name,
      };
    });
  }
}
