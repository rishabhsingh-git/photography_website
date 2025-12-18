import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { PaymentService } from './payment.service';

@Controller('payments')
export class PaymentController {
  constructor(private readonly payments: PaymentService) {}

  @UseGuards(JwtAuthGuard)
  @Post('order')
  create(@Req() req: any, @Body() body: { amount: number; currency?: string }) {
    return this.payments.createOrder(req.user.userId, body.amount, body.currency);
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
    return { verified };
  }
}
