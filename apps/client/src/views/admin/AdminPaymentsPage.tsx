import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../../api/client";
import { Button } from "../../ui/primitives/Button";
import { Card, CardContent } from "../../ui/primitives/Card";
import { Table, THead, TBody, TR, TH, TD } from "../../ui/primitives/Table";
import { Skeleton } from "../../ui/skeletons/Skeleton";
import { useToastStore } from "../../ui/primitives/ToastStore";
import { Badge } from "../../ui/primitives/Badge";

interface CustomerPayment {
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  customerAddress: string | null;
  totalAmount: number;
  totalPayments: number;
  payments: Array<{
    id: string;
    orderId: string;
    amount: number;
    status: string;
    createdAt: string;
    paymentId: string | null;
  }>;
}

interface RefundDialogProps {
  payment: CustomerPayment['payments'][0];
  customerName: string;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

const RefundDialog: React.FC<RefundDialogProps> = ({
  payment,
  customerName,
  onConfirm,
  onCancel,
  isOpen,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <Card className="max-w-md w-full mx-4 border-red-500 border-2">
        <CardContent className="p-6 space-y-4">
          <div className="text-center space-y-2">
            <div className="text-4xl mb-2">⚠️</div>
            <h2 className="text-2xl font-bold text-red-500">Confirm Refund</h2>
            <p className="text-slate-300 font-semibold">This action cannot be undone!</p>
          </div>

          <div className="bg-red-950/30 border border-red-800 rounded-lg p-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Customer:</span>
              <span className="text-slate-100 font-semibold">{customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Order ID:</span>
              <span className="text-slate-100 font-mono text-sm">{payment.orderId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Amount:</span>
              <span className="text-slate-100 font-semibold">₹{payment.amount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Payment ID:</span>
              <span className="text-slate-100 font-mono text-xs">{payment.paymentId || "N/A"}</span>
            </div>
          </div>

          <div className="bg-red-950/20 border border-red-900/50 rounded-lg p-3">
            <p className="text-red-400 text-sm font-medium">
              ⚠️ Are you absolutely sure you want to refund this payment? This will process a refund through Razorpay and cannot be reversed.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="danger"
              className="flex-1"
              onClick={onConfirm}
            >
              Yes, Refund Payment
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const AdminPaymentsPage: React.FC = () => {
  const { add } = useToastStore();
  const queryClient = useQueryClient();
  const [selectedPayment, setSelectedPayment] = useState<{
    payment: CustomerPayment['payments'][0];
    customerName: string;
  } | null>(null);

  const { data: customers, isLoading } = useQuery<CustomerPayment[]>({
    queryKey: ["analytics", "payments-by-customer"],
    queryFn: async () => {
      const { data } = await api.get("/analytics/payments-by-customer");
      return data;
    },
  });

  const refundMutation = useMutation({
    mutationFn: async (paymentId: string) => {
      const { data } = await api.post(`/payments/refund/${paymentId}`, {});
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["analytics", "payments-by-customer"] });
      add({ title: "Refund processed successfully", kind: "success" });
      setSelectedPayment(null);
    },
    onError: (err: any) => {
      add({
        title: "Refund failed",
        description: err?.response?.data?.message || "Failed to process refund",
        kind: "error",
      });
    },
  });

  const handleRefundClick = (payment: CustomerPayment['payments'][0], customerName: string) => {
    if (payment.status !== "paid") {
      add({ title: "Only paid payments can be refunded", kind: "error" });
      return;
    }
    setSelectedPayment({ payment, customerName });
  };

  const handleConfirmRefund = () => {
    if (selectedPayment) {
      refundMutation.mutate(selectedPayment.payment.id);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      paid: "bg-green-500/20 text-green-400 border-green-500/50",
      failed: "bg-red-500/20 text-red-400 border-red-500/50",
      created: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
      refunded: "bg-purple-500/20 text-purple-400 border-purple-500/50",
    };
    return (
      <Badge className={colors[status] || "bg-slate-500/20 text-slate-400 border-slate-500/50"}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">Customer Payments</h1>
          <p className="text-slate-400 text-sm mt-1">
            View all payments grouped by customer with refund capabilities
          </p>
        </div>
      </div>

      {!customers || customers.length === 0 ? (
        <Card>
          <CardContent className="text-center py-10">
            <p className="text-slate-400">No payments found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {customers.map((customer) => (
            <Card key={customer.customerId} className="border-slate-800">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4 pb-4 border-b border-slate-800">
                  <div className="space-y-1">
                    <h3 className="text-lg font-semibold text-slate-50">{customer.customerName}</h3>
                    <p className="text-sm text-slate-400">{customer.customerEmail}</p>
                    {customer.customerPhone && (
                      <p className="text-sm text-slate-400">Phone: {customer.customerPhone}</p>
                    )}
                    {customer.customerAddress && (
                      <p className="text-sm text-slate-400">Address: {customer.customerAddress}</p>
                    )}
                  </div>
                  <div className="text-right space-y-1">
                    <p className="text-sm text-slate-400">Total Payments</p>
                    <p className="text-xl font-semibold text-slate-50">{customer.totalPayments}</p>
                    <p className="text-sm text-slate-400">Total Amount</p>
                    <p className="text-xl font-semibold text-green-400">
                      ₹{customer.totalAmount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <Table>
                  <THead>
                    <TR>
                      <TH>Order ID</TH>
                      <TH>Amount</TH>
                      <TH>Status</TH>
                      <TH>Date</TH>
                      <TH>Actions</TH>
                    </TR>
                  </THead>
                  <TBody>
                    {customer.payments.map((payment) => (
                      <TR key={payment.id}>
                        <TD className="font-mono text-xs text-slate-300">{payment.orderId}</TD>
                        <TD className="font-semibold">₹{payment.amount.toLocaleString("en-IN")}</TD>
                        <TD>{getStatusBadge(payment.status)}</TD>
                        <TD className="text-sm text-slate-400">
                          {new Date(payment.createdAt).toLocaleString()}
                        </TD>
                        <TD>
                          {payment.status === "paid" && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleRefundClick(payment, customer.customerName)}
                              disabled={refundMutation.isPending}
                            >
                              Refund
                            </Button>
                          )}
                          {payment.status === "refunded" && (
                            <span className="text-xs text-purple-400">Refunded</span>
                          )}
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {selectedPayment && (
        <RefundDialog
          payment={selectedPayment.payment}
          customerName={selectedPayment.customerName}
          onConfirm={handleConfirmRefund}
          onCancel={() => setSelectedPayment(null)}
          isOpen={!!selectedPayment}
        />
      )}
    </div>
  );
};

export default AdminPaymentsPage;
