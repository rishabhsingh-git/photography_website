import * as crypto from 'crypto';

import { Injectable } from '@nestjs/common';
import Razorpay from 'razorpay';

import { PaymentAdapter } from '../types';

@Injectable()
export class RazorpayAdapter implements PaymentAdapter {
  private readonly client: Razorpay;

  constructor() {
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    
    if (!keyId || !keySecret || keyId === 'dummy' || keySecret === 'dummy') {
      throw new Error('Razorpay credentials are missing or invalid. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.');
    }
    
    this.client = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });
  }

  async createOrder(params: { amount: number; currency: string }) {
    // critical: amount in paise to avoid floating errors
    return this.client.orders.create({
      amount: Math.round(params.amount * 100),
      currency: params.currency,
      payment_capture: true,
    });
  }

  verifySignature(data: { orderId: string; paymentId: string; signature: string }): boolean {
    const payload = `${data.orderId}|${data.paymentId}`;
    const digest = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(payload)
      .digest('hex');
    return digest === data.signature;
  }
}
