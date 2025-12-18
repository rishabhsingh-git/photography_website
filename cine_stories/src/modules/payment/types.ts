export interface PaymentAdapter {
  createOrder(params: { amount: number; currency: string }): Promise<any>;
  verifySignature(data: { orderId: string; paymentId: string; signature: string }): boolean;
}
