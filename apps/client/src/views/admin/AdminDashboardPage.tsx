import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "../../ui/primitives/Card";
import { Badge } from "../../ui/primitives/Badge";
import { usePayments } from "../../hooks/usePayments";
import { useFunnelData } from "../../hooks/useAnalytics";
import { useUsers } from "../../hooks/useUsers";
import { useAdminServices } from "../../hooks/useAdminServices";
import { useAssets } from "../../hooks/useAssets";
import { api } from "../../api/client";
import { Skeleton } from "../../ui/skeletons/Skeleton";
import { Select } from "../../ui/primitives/Select";

const AdminDashboardPage: React.FC = () => {
  const [days, setDays] = useState(30);
  const payments = usePayments({ limit: 100 });
  const funnel = useFunnelData();
  const users = useUsers();
  const { servicesQuery } = useAdminServices();
  const assets = useAssets();
  
  const paymentsList = Array.isArray(payments.data) ? payments.data : [];
  const funnelData = funnel.data?.funnel || {};
  const conversionRates = funnel.data?.conversionRates || {};
  const usersList = Array.isArray(users.data) ? users.data : [];
  const servicesList = Array.isArray(servicesQuery?.data) ? servicesQuery?.data : [];
  const assetsList = Array.isArray(assets.assetsQuery?.data) ? assets.assetsQuery?.data : [];

  // Calculate total revenue from payments
  const totalRevenue = paymentsList
    .filter((p) => p.status === "paid" || p.status === "captured")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const paidPayments = paymentsList.filter((p) => p.status === "paid" || p.status === "captured").length;
  const activeServices = servicesList.filter((s) => s.isActive).length;
  const totalUsers = usersList.length;
  const adminUsers = usersList.filter((u) => u.roles?.includes("admin")).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">Analytics Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">Track user funnel and payment analytics</p>
        </div>
        <div className="w-48">
          <Select value={days} onChange={(e) => setDays(Number(e.target.value))}>
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="text-sm text-slate-400">Total Revenue</CardHeader>
          <CardContent className="text-2xl font-semibold text-green-400">
            ₹{totalRevenue.toLocaleString("en-IN")}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-sm text-slate-400">Successful Payments</CardHeader>
          <CardContent className="text-2xl font-semibold">
            {paidPayments}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-sm text-slate-400">Total Users</CardHeader>
          <CardContent className="text-2xl font-semibold">
            {totalUsers}
          </CardContent>
          <CardContent className="text-xs text-slate-500 pt-0">
            {adminUsers} admin{adminUsers !== 1 ? 's' : ''}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-sm text-slate-400">Active Services</CardHeader>
          <CardContent className="text-2xl font-semibold">
            {activeServices} / {servicesList.length}
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="text-sm text-slate-400">Assets</CardHeader>
          <CardContent className="text-2xl font-semibold">
            {assetsList.length}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-sm text-slate-400">Cart Additions</CardHeader>
          <CardContent className="text-2xl font-semibold">
            {funnelData.addToCarts || 0}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="text-sm text-slate-400">Overall Conversion</CardHeader>
          <CardContent className="text-2xl font-semibold text-sky-400">
            {conversionRates.overallConversion || "0"}%
          </CardContent>
        </Card>
      </div>

      {/* Funnel Chart */}
      <Card>
        <CardHeader className="font-semibold">Sales Funnel</CardHeader>
        <CardContent>
          {funnel.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <div className="space-y-6">
              {/* Funnel Steps */}
              <div className="space-y-4">
                <FunnelStep
                  label="Page Views"
                  count={funnelData.pageViews || 0}
                  percentage={100}
                  color="bg-sky-500"
                />
                <FunnelStep
                  label="Service Views"
                  count={funnelData.serviceViews || 0}
                  percentage={funnelData.pageViews ? ((funnelData.serviceViews / funnelData.pageViews) * 100) : 0}
                  color="bg-blue-500"
                />
                <FunnelStep
                  label="Add to Cart"
                  count={funnelData.addToCarts || 0}
                  percentage={funnelData.serviceViews ? ((funnelData.addToCarts / funnelData.serviceViews) * 100) : 0}
                  color="bg-indigo-500"
                />
                <FunnelStep
                  label="Checkout Started"
                  count={funnelData.checkoutStarts || 0}
                  percentage={funnelData.addToCarts ? ((funnelData.checkoutStarts / funnelData.addToCarts) * 100) : 0}
                  color="bg-purple-500"
                />
                <FunnelStep
                  label="Payment Initiated"
                  count={funnelData.paymentInitiated || 0}
                  percentage={funnelData.checkoutStarts ? ((funnelData.paymentInitiated / funnelData.checkoutStarts) * 100) : 0}
                  color="bg-pink-500"
                />
                <FunnelStep
                  label="Payment Success"
                  count={funnelData.paymentSuccess || 0}
                  percentage={funnelData.paymentInitiated ? ((funnelData.paymentSuccess / funnelData.paymentInitiated) * 100) : 0}
                  color="bg-green-500"
                />
              </div>

              {/* Conversion Rates */}
              <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-slate-800">
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Service View → Cart</p>
                  <p className="text-lg font-semibold">{conversionRates.serviceViewToCart || "0"}%</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Cart → Checkout</p>
                  <p className="text-lg font-semibold">{conversionRates.cartToCheckout || "0"}%</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Checkout → Payment</p>
                  <p className="text-lg font-semibold">{conversionRates.checkoutToPayment || "0"}%</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-slate-400">Payment Success Rate</p>
                  <p className="text-lg font-semibold">{conversionRates.paymentSuccessRate || "0"}%</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader className="font-semibold">Recent Payments</CardHeader>
        <CardContent className="space-y-3">
          {payments.isLoading && <Skeleton className="h-28 w-full" />}
          {!payments.isLoading && paymentsList.length === 0 && (
            <p className="text-slate-400 text-center py-4">No payments yet</p>
          )}
          {!payments.isLoading &&
            paymentsList.slice(0, 10).map((p) => (
              <div key={p.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold">₹{p.amount.toLocaleString("en-IN")}</p>
                  <p className="text-slate-400 text-xs font-mono">{p.id}</p>
                </div>
                <Badge
                  variant={
                    p.status === "paid" || p.status === "captured"
                      ? "success"
                      : p.status === "failed"
                      ? "danger"
                      : p.status === "refunded"
                      ? "warning"
                      : "muted"
                  }
                >
                  {p.status}
                </Badge>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
};

interface FunnelStepProps {
  label: string;
  count: number;
  percentage: number;
  color: string;
}

const FunnelStep: React.FC<FunnelStepProps> = (props) => {
  const { label, count, percentage, color } = props;
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300">{label}</span>
        <span className="text-slate-400">{count} ({percentage.toFixed(1)}%)</span>
      </div>
      <div className="h-8 bg-slate-800 rounded-lg overflow-hidden">
        <div
          className={`h-full ${color} transition-all duration-500 flex items-center justify-end pr-2`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        >
          {percentage > 10 && (
            <span className="text-xs font-semibold text-white">{percentage.toFixed(1)}%</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
