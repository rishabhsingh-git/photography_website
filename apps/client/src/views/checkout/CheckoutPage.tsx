import React, { useEffect, useState } from "react";
import { useCart } from "../../hooks/useCart";
import { Button } from "../../ui/primitives/Button";
import { Card, CardContent } from "../../ui/primitives/Card";
import { useToastStore } from "../../ui/primitives/ToastStore";
import { api } from "../../api/client";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const CheckoutPage: React.FC = () => {
  const { cartQuery } = useCart();
  const { add } = useToastStore();
  // Ensure cart items is always an array
  const cartItems = Array.isArray(cartQuery.data) ? cartQuery.data : [];
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const scriptId = "razorpay-js";
    if (document.getElementById(scriptId)) {
      setReady(true);
      return;
    }
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => setReady(true);
    script.onerror = () => add({ title: "Failed to load Razorpay", kind: "error" });
    document.body.appendChild(script);
  }, [add]);

  const total = cartItems.reduce((sum, item) => sum + (item.service?.price ?? 0) * item.quantity, 0);

  const handlePay = async () => {
    try {
      setLoading(true);
      const { data } = await api.post("/payments/order", { amount: total });
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Cine Stories",
        description: "Photography Services",
        order_id: data.orderId,
        handler: async (response: any) => {
          await api.post("/payments/verify", response);
          add({ title: "Payment successful", kind: "success" });
          window.location.href = "/dashboard";
        },
        theme: { color: "#0ea5e9" },
        modal: {
          ondismiss: () => add({ title: "Payment cancelled", kind: "info" }),
        },
      };
      if (ready && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        add({ title: "Razorpay not ready", kind: "error" });
      }
    } catch (err: any) {
      add({
        title: "Payment failed",
        description: err?.response?.data?.message ?? "Retry or contact support",
        kind: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Checkout</p>
        <h1 className="text-3xl font-semibold text-slate-50">Secure Razorpay payment.</h1>
      </div>

      <Card>
        <CardContent className="space-y-3">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center justify-between text-sm">
              <div>
                <p className="font-semibold text-slate-100">{item.service?.title}</p>
                <p className="text-slate-400">Qty {item.quantity}</p>
              </div>
              <p className="font-semibold">
                ₹{((item.service?.price ?? 0) * item.quantity).toLocaleString("en-IN")}
              </p>
            </div>
          ))}
          <div className="h-px bg-slate-800" />
          <div className="flex items-center justify-between text-base font-semibold">
            <span>Total</span>
            <span>₹{total.toLocaleString("en-IN")}</span>
          </div>
          <Button block size="lg" onClick={handlePay} loading={loading}>
          Pay with Razorpay
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutPage;


