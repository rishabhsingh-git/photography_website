import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Payment, PaymentProvider } from '../../infrastructure/database/entities/payment.entity';
import { NotificationChannel } from '../../infrastructure/database/entities/notification.entity';
import { NotificationService } from '../notification/notification.service';
import { CartService } from '../cart/cart.service';

import { PaymentAdapter } from './types';

@Injectable()
export class PaymentService {
  constructor(
    @Inject('PaymentAdapter') private readonly adapter: PaymentAdapter,
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    private readonly notifications: NotificationService,
    private readonly cart: CartService,
  ) {}

  async createOrder(userId: string, amount: number, currency = 'INR') {
    try {
      const order = await this.adapter.createOrder({ amount, currency });
      const payment = this.payments.create({
        provider: PaymentProvider.RAZORPAY,
        referenceId: order.id,
        payload: order,
        status: 'created',
        user: { id: userId } as any,
      });
      await this.payments.save(payment);
      return order;
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
    await this.payments.update({ referenceId: data.orderId }, { status: ok ? 'paid' : 'failed' });

    // Load payment with user for notifications & cart clearing
    const payment = await this.payments.findOne({
      where: { referenceId: data.orderId },
      relations: ['user'],
    });

    if (ok && payment && payment.user) {
      const payloadBase = {
        type: 'payment_success',
        provider: payment.provider,
        orderId: data.orderId,
        paymentId: data.paymentId,
        userId: payment.user.id,
        email: (payment.user as any).email,
        rawPayload: payment.payload,
      };

      // Enqueue notifications for different channels (email, sms, whatsapp)
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
      ]);

      // Clear cart after successful payment
      await this.cart.clearCart(payment.user.id);
    }

    return ok;
  }
}
