import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Payment, PaymentProvider } from '../../infrastructure/database/entities/payment.entity';
import { NotificationChannel } from '../../infrastructure/database/entities/notification.entity';
import { User, UserRole, AuthProvider } from '../../infrastructure/database/entities/user.entity';
import { CartItem } from '../../infrastructure/database/entities/cart.entity';
import { NotificationService } from '../notification/notification.service';
import { CartService } from '../cart/cart.service';
import { InvoiceService } from './invoice.service';

import { PaymentAdapter } from './types';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('PaymentAdapter') private readonly adapter: PaymentAdapter,
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(CartItem) private readonly cartItems: Repository<CartItem>,
    private readonly notifications: NotificationService,
    private readonly cart: CartService,
    private readonly invoice: InvoiceService,
  ) {}

  async createGuestUser(): Promise<User> {
    const guestEmail = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}@guest.local`;
    const guestUser = this.users.create({
      email: guestEmail,
      provider: AuthProvider.LOCAL,
      roles: [UserRole.CLIENT],
      name: 'Guest User',
    });
    return this.users.save(guestUser);
  }

  async createOrder(
    userId: string,
    amount: number,
    currency = 'INR',
    customerDetails?: {
      name?: string;
      email?: string;
      phone?: string;
      address?: string;
    },
  ) {
    try {
      // Update user with customer details if provided
      if (customerDetails) {
        const user = await this.users.findOne({ where: { id: userId } });
        if (user) {
          // Only update fields that don't conflict with unique constraints
          if (customerDetails.name) user.name = customerDetails.name;
          if (customerDetails.phone) user.phone = customerDetails.phone;
          if (customerDetails.address) user.address = customerDetails.address;
          
          // Check if email already exists before updating
          if (customerDetails.email) {
            const existingUser = await this.users.findOne({
              where: { email: customerDetails.email },
            });
            // Only update email if it doesn't exist or belongs to the same user
            if (!existingUser || existingUser.id === userId) {
              user.email = customerDetails.email;
            }
            // If email exists for another user, keep the current email
            // The customer email will still be stored in payment payload
          }
          
          await this.users.save(user);
        }
      }

      // Get cart items to store in payment payload for invoice generation
      const cartItems = await this.cartItems.find({
        where: { user: { id: userId } },
        relations: ['service'],
      });

      const order = await this.adapter.createOrder({ amount, currency });
      const payment = this.payments.create({
        provider: PaymentProvider.RAZORPAY,
        referenceId: order.id,
        payload: { ...order, customerDetails, cartItems },
        status: 'created',
        user: { id: userId } as any,
      });
      await this.payments.save(payment);
      
      // Return formatted response for Razorpay frontend integration
      return {
        key: process.env.RAZORPAY_KEY_ID,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
      };
    } catch (error: any) {
      // Better error handling for Razorpay errors
      if (error.error?.code === 'BAD_REQUEST_ERROR') {
        throw new Error(`Razorpay authentication failed: ${error.error?.description || 'Invalid credentials'}`);
      }
      throw error;
    }
  }

  async verifySignature(data: { orderId: string; paymentId: string; signature: string }) {
    const ok = this.adapter.verifySignature(data);
    
    // Update payment status and store payment ID in payload
    const payment = await this.payments.findOne({
      where: { referenceId: data.orderId },
      relations: ['user'],
    });

    if (payment) {
      payment.status = ok ? 'paid' : 'failed';
      payment.payload = {
        ...payment.payload,
        razorpay_payment_id: data.paymentId,
      } as any;
      await this.payments.save(payment);
    }

    if (ok && payment && payment.user) {
      // Get cart items from payment payload (stored before clearing cart)
      const cartItems = (payment.payload as any)?.cartItems || [];

      // Generate invoice
      let invoiceBuffer: Buffer | null = null;
      try {
        invoiceBuffer = await this.invoice.generateInvoiceBuffer(payment, cartItems, payment.user);
      } catch (error) {
        console.error('Failed to generate invoice:', error);
      }

      const payloadBase = {
        type: 'payment_success',
        provider: payment.provider,
        orderId: data.orderId,
        paymentId: data.paymentId,
        userId: payment.user.id,
        email: payment.user.email,
        phone: payment.user.phone,
        name: payment.user.name,
        invoice: invoiceBuffer ? invoiceBuffer.toString('base64') : null,
        rawPayload: payment.payload,
      };

      // Enqueue notifications for different channels (email, sms, whatsapp, push)
      await Promise.all([
        this.notifications.enqueue(NotificationChannel.EMAIL, {
          ...payloadBase,
          channel: NotificationChannel.EMAIL,
        }),
        this.notifications.enqueue(NotificationChannel.SMS, {
          ...payloadBase,
          channel: NotificationChannel.SMS,
        }),
        this.notifications.enqueue(NotificationChannel.WHATSAPP, {
          ...payloadBase,
          channel: NotificationChannel.WHATSAPP,
        }),
        this.notifications.enqueue(NotificationChannel.PUSH, {
          ...payloadBase,
          channel: NotificationChannel.PUSH,
        }),
      ]);

      // Clear cart after successful payment
      await this.cart.clearCart(payment.user.id);
    }

    return ok;
  }

  async refundPayment(paymentId: string, amount?: number, notes?: string) {
    const payment = await this.payments.findOne({
      where: { id: paymentId },
      relations: ['user'],
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    if (payment.status !== 'paid') {
      throw new BadRequestException('Only paid payments can be refunded');
    }

    const razorpayPaymentId = (payment.payload as any)?.razorpay_payment_id;
    if (!razorpayPaymentId) {
      throw new BadRequestException('Payment ID not found in payment record');
    }

    try {
      const refund = await this.adapter.refundPayment({
        paymentId: razorpayPaymentId,
        amount,
        notes: notes || `Refund for order ${payment.referenceId}`,
      });

      // Update payment status
      payment.status = 'refunded';
      payment.payload = {
        ...payment.payload,
        refund: refund,
        refundedAt: new Date().toISOString(),
      } as any;
      await this.payments.save(payment);

      // Send refund notification
      if (payment.user) {
        const payloadBase = {
          type: 'payment_refunded',
          provider: payment.provider,
          orderId: payment.referenceId,
          paymentId: razorpayPaymentId,
          refundId: refund.id,
          amount: refund.amount ? refund.amount / 100 : undefined,
          userId: payment.user.id,
          email: payment.user.email,
          phone: payment.user.phone,
          name: payment.user.name,
        };

        await Promise.all([
          this.notifications.enqueue(NotificationChannel.EMAIL, {
            ...payloadBase,
            channel: NotificationChannel.EMAIL,
          }),
          this.notifications.enqueue(NotificationChannel.SMS, {
            ...payloadBase,
            channel: NotificationChannel.SMS,
          }),
        ]);
      }

      return refund;
    } catch (error: any) {
      throw new Error(`Refund failed: ${error.message || 'Unknown error'}`);
    }
  }
}
