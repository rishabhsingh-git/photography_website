import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';

import { AnalyticsEvent, AnalyticsEventType } from '../../infrastructure/database/entities/analytics.entity';
import { Payment } from '../../infrastructure/database/entities/payment.entity';
import { User } from '../../infrastructure/database/entities/user.entity';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectRepository(AnalyticsEvent) private readonly events: Repository<AnalyticsEvent>,
    @InjectRepository(Payment) private readonly payments: Repository<Payment>,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {}

  async trackEvent(
    eventType: AnalyticsEventType,
    userId?: string | null,
    metadata?: Record<string, unknown>,
    sessionId?: string,
    userAgent?: string,
    ipAddress?: string,
  ) {
    const event = this.events.create({
      eventType,
      metadata: metadata || {},
      user: userId ? ({ id: userId } as any) : null,
      sessionId,
      userAgent,
      ipAddress,
    });
    return this.events.save(event);
  }

  async getFunnelData(startDate?: Date, endDate?: Date) {
    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default 30 days
    const end = endDate || new Date();

    const [
      pageViews,
      serviceViews,
      addToCarts,
      checkoutStarts,
      paymentInitiated,
      paymentSuccess,
      paymentFailed,
    ] = await Promise.all([
      this.events.count({
        where: { eventType: AnalyticsEventType.PAGE_VIEW, createdAt: Between(start, end) },
      }),
      this.events.count({
        where: { eventType: AnalyticsEventType.SERVICE_VIEW, createdAt: Between(start, end) },
      }),
      this.events.count({
        where: { eventType: AnalyticsEventType.ADD_TO_CART, createdAt: Between(start, end) },
      }),
      this.events.count({
        where: { eventType: AnalyticsEventType.CHECKOUT_START, createdAt: Between(start, end) },
      }),
      this.events.count({
        where: { eventType: AnalyticsEventType.PAYMENT_INITIATED, createdAt: Between(start, end) },
      }),
      this.events.count({
        where: { eventType: AnalyticsEventType.PAYMENT_SUCCESS, createdAt: Between(start, end) },
      }),
      this.events.count({
        where: { eventType: AnalyticsEventType.PAYMENT_FAILED, createdAt: Between(start, end) },
      }),
    ]);

    return {
      funnel: {
        pageViews,
        serviceViews,
        addToCarts,
        checkoutStarts,
        paymentInitiated,
        paymentSuccess,
        paymentFailed,
      },
      conversionRates: {
        serviceViewToCart: addToCarts > 0 ? ((addToCarts / serviceViews) * 100).toFixed(2) : '0',
        cartToCheckout: checkoutStarts > 0 ? ((checkoutStarts / addToCarts) * 100).toFixed(2) : '0',
        checkoutToPayment: paymentInitiated > 0 ? ((paymentInitiated / checkoutStarts) * 100).toFixed(2) : '0',
        paymentSuccessRate: paymentInitiated > 0 ? ((paymentSuccess / paymentInitiated) * 100).toFixed(2) : '0',
        overallConversion: pageViews > 0 ? ((paymentSuccess / pageViews) * 100).toFixed(2) : '0',
      },
    };
  }

  async getUserJourney(userId: string) {
    const events = await this.events.find({
      where: { user: { id: userId } },
      order: { createdAt: 'ASC' },
    });

    return events.map((e) => ({
      eventType: e.eventType,
      page: e.page,
      metadata: e.metadata,
      timestamp: e.createdAt,
    }));
  }

  async getPaymentsByCustomer() {
    const payments = await this.payments.find({
      where: { status: 'paid' },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });

    // Group by customer
    const customerMap = new Map<string, any>();

    for (const payment of payments) {
      const customerEmail = payment.user?.email || 'Unknown';
      const customerName = payment.user?.name || 'Guest User';
      const customerId = payment.user?.id || 'guest';

      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          customerId,
          customerName,
          customerEmail,
          customerPhone: payment.user?.phone || null,
          customerAddress: payment.user?.address || null,
          totalAmount: 0,
          totalPayments: 0,
          payments: [],
        });
      }

      const customer = customerMap.get(customerId);
      const amount = (payment.payload as any)?.amount || 0;
      customer.totalAmount += amount / 100; // Convert from paise
      customer.totalPayments += 1;
      customer.payments.push({
        id: payment.id,
        orderId: payment.referenceId,
        amount: amount / 100,
        status: payment.status,
        createdAt: payment.createdAt,
        paymentId: (payment.payload as any)?.razorpay_payment_id || null,
      });
    }

    return Array.from(customerMap.values());
  }

  async getDailyStats(days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const events = await this.events
      .createQueryBuilder('event')
      .select("DATE(event.createdAt)", 'date')
      .addSelect('event.eventType', 'eventType')
      .addSelect('COUNT(*)', 'count')
      .where('event.createdAt >= :startDate', { startDate })
      .groupBy('date')
      .addGroupBy('event.eventType')
      .orderBy('date', 'ASC')
      .getRawMany();

    return events;
  }
}

