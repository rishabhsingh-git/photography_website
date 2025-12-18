import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Payment } from '../../infrastructure/database/entities/payment.entity';
import { NotificationModule } from '../notification/notification.module';
import { CartModule } from '../cart/cart.module';

import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { RazorpayAdapter } from './providers/razorpay.adapter';

@Module({
  imports: [TypeOrmModule.forFeature([Payment]), NotificationModule, CartModule],
  controllers: [PaymentController],
  providers: [
    PaymentService,
    {
      provide: 'PaymentAdapter',
      useClass: RazorpayAdapter,
    },
  ],
  exports: [PaymentService],
})
export class PaymentModule {}
