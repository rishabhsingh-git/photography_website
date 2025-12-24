import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Payment } from '../../infrastructure/database/entities/payment.entity';
import { User } from '../../infrastructure/database/entities/user.entity';
import { CartItem } from '../../infrastructure/database/entities/cart.entity';
import { NotificationModule } from '../notification/notification.module';
import { CartModule } from '../cart/cart.module';
import { AnalyticsModule } from '../analytics/analytics.module';

import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { InvoiceService } from './invoice.service';
import { RazorpayAdapter } from './providers/razorpay.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, User, CartItem]), NotificationModule, CartModule, AnalyticsModule],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    InvoiceService,
    {
      provide: 'PaymentAdapter',
      useClass: RazorpayAdapter,
    },
  ],
  exports: [PaymentService, InvoiceService],
})
export class PaymentModule {}
