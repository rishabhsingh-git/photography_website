import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../ui/primitives/Button";
import { Card, CardContent } from "../../ui/primitives/Card";
import { api } from "../../api/client";

const PaymentSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId");
  const [downloading, setDownloading] = useState(false);

  const downloadInvoice = async () => {
    if (!orderId) return;
    try {
      setDownloading(true);
      const response = await api.get(`/payments/invoice/${orderId}`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `invoice-${orderId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to download invoice:", error);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <Card>
        <CardContent className="text-center space-y-6 py-10">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-semibold text-slate-50">Payment Successful!</h1>
          <p className="text-slate-400">
            Thank you for your purchase. Your payment has been processed successfully.
          </p>
          {orderId && (
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-slate-400">Order ID</p>
              <p className="text-slate-100 font-mono">{orderId}</p>
            </div>
          )}
          <div className="flex gap-4 justify-center">
            <Button onClick={downloadInvoice} loading={downloading}>
              Download Invoice
            </Button>
            <Button variant="secondary" onClick={() => navigate("/services")}>
              Browse More Services
            </Button>
            <Button variant="secondary" onClick={() => navigate("/dashboard")}>
              Go to Dashboard
            </Button>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-sm text-slate-500">
              A confirmation email with your invoice has been sent to your registered email address.
              You will also receive SMS and WhatsApp notifications.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentSuccessPage;

