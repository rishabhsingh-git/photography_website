import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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

interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
}

const CheckoutPage: React.FC = () => {
  const { cartQuery } = useCart();
  const { add } = useToastStore();
  const navigate = useNavigate();
  // Ensure cart items is always an array
  const cartItems = Array.isArray(cartQuery.data) ? cartQuery.data : [];
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: "",
    email: "",
    phone: "",
    address: "",
  });
  const [errors, setErrors] = useState<Partial<CustomerDetails>>({});

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

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerDetails> = {};
    
    if (!customerDetails.name.trim()) {
      newErrors.name = "Name is required";
    }
    if (!customerDetails.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerDetails.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!customerDetails.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^[0-9]{10}$/.test(customerDetails.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Invalid phone number (10 digits required)";
    }
    if (!customerDetails.address.trim()) {
      newErrors.address = "Address is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePay = async () => {
    if (!validateForm()) {
      add({ title: "Please fill all required fields", kind: "error" });
      return;
    }

    try {
      setLoading(true);
      setShowForm(false);
      const { data } = await api.post("/payments/order", {
        amount: total,
        customerDetails: {
          name: customerDetails.name,
          email: customerDetails.email,
          phone: customerDetails.phone,
          address: customerDetails.address,
        },
      });
      const options = {
        key: data.key,
        amount: data.amount,
        currency: data.currency,
        name: "Cine Storiees",
        description: "Photography Services",
        order_id: data.orderId,
        prefill: {
          name: customerDetails.name,
          email: customerDetails.email,
          contact: customerDetails.phone,
        },
        handler: async (response: any) => {
          try {
            const verifyResponse = await api.post("/payments/verify", response);
            if (verifyResponse.data.verified) {
              add({ title: "Payment successful", kind: "success" });
              navigate(`/payment/success?orderId=${response.razorpay_order_id}`);
            } else {
              add({ title: "Payment verification failed", kind: "error" });
              navigate(`/payment/failed?orderId=${response.razorpay_order_id}`);
            }
          } catch (err: any) {
            add({
              title: "Payment verification failed",
              description: err?.response?.data?.message ?? "Please contact support",
              kind: "error",
            });
            navigate(`/payment/failed?orderId=${response.razorpay_order_id}`);
          }
        },
        theme: { color: "#0ea5e9" },
        modal: {
          ondismiss: () => {
            add({ title: "Payment cancelled", kind: "info" });
            setShowForm(true);
            setLoading(false);
          },
        },
      };
      if (ready && window.Razorpay) {
        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", (response: any) => {
          add({
            title: "Payment failed",
            description: response.error?.description || "Payment could not be processed",
            kind: "error",
          });
          navigate(`/payment/failed?orderId=${response.razorpay_order_id}`);
        });
        rzp.open();
      } else {
        add({ title: "Razorpay not ready", kind: "error" });
        setShowForm(true);
        setLoading(false);
      }
    } catch (err: any) {
      add({
        title: "Payment failed",
        description: err?.response?.data?.message ?? "Retry or contact support",
        kind: "error",
      });
      setShowForm(true);
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Checkout</p>
          <h1 className="text-3xl font-semibold text-slate-50">Your cart is empty</h1>
        </div>
        <Card>
          <CardContent className="text-center py-10">
            <p className="text-slate-400 mb-4">Add services to your cart to proceed with checkout</p>
            <Button onClick={() => navigate("/services")}>Browse Services</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Checkout</p>
        <h1 className="text-3xl font-semibold text-slate-50">Complete your purchase</h1>
      </div>

      {showForm && (
        <Card>
          <CardContent className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-50 mb-4">Customer Details</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={customerDetails.name}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Enter your full name"
                />
                {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={customerDetails.email}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="your.email@example.com"
                />
                {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Phone Number <span className="text-red-400">*</span>
                </label>
                <input
                  type="tel"
                  value={customerDetails.phone}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="10-digit phone number"
                />
                {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Address <span className="text-red-400">*</span>
                </label>
                <textarea
                  value={customerDetails.address}
                  onChange={(e) => setCustomerDetails({ ...customerDetails, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Enter your complete address"
                  rows={3}
                />
                {errors.address && <p className="text-red-400 text-xs mt-1">{errors.address}</p>}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-50 mb-4">Order Summary</h2>
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
          {showForm && (
            <Button block size="lg" onClick={handlePay} loading={loading}>
              Proceed to Payment
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutPage;
