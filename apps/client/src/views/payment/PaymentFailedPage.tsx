import React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../../ui/primitives/Button";
import { Card, CardContent } from "../../ui/primitives/Card";

const PaymentFailedPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const orderId = searchParams.get("orderId");

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <Card>
        <CardContent className="text-center space-y-6 py-10">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-3xl font-semibold text-slate-50">Payment Failed</h1>
          <p className="text-slate-400">
            We're sorry, but your payment could not be processed at this time.
          </p>
          {orderId && (
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-sm text-slate-400">Order ID</p>
              <p className="text-slate-100 font-mono">{orderId}</p>
            </div>
          )}
          <div className="bg-red-950/20 border border-red-800/50 rounded-lg p-4 text-left">
            <p className="text-sm text-red-400 font-semibold mb-2">What to do next:</p>
            <ul className="text-sm text-slate-400 space-y-1 list-disc list-inside">
              <li>Check your payment method and try again</li>
              <li>Ensure you have sufficient funds</li>
              <li>Verify your card details are correct</li>
              <li>Contact your bank if the issue persists</li>
            </ul>
          </div>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => navigate("/checkout")}>
              Try Again
            </Button>
            <Button variant="secondary" onClick={() => navigate("/cart")}>
              Back to Cart
            </Button>
            <Button variant="secondary" onClick={() => navigate("/services")}>
              Browse Services
            </Button>
          </div>
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-sm text-slate-500">
              If you continue to experience issues, please contact our support team.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentFailedPage;

