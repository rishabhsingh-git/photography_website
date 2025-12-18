import React from "react";
import { Card, CardContent, CardHeader } from "../../ui/primitives/Card";
import { Badge } from "../../ui/primitives/Badge";
import { usePayments } from "../../hooks/usePayments";
import { useNotifications } from "../../hooks/useNotifications";
import { Skeleton } from "../../ui/skeletons/Skeleton";

const AdminDashboardPage: React.FC = () => {
  const payments = usePayments({ limit: 5 });
  const notifications = useNotifications();
  // Ensure payments and notifications are always arrays
  const paymentsList = Array.isArray(payments.data) ? payments.data : [];
  const notificationsList = Array.isArray(notifications.data) ? notifications.data : [];

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="text-sm text-slate-400">Total Revenue</CardHeader>
          <CardContent className="text-2xl font-semibold">₹12,40,000</CardContent>
        </Card>
        <Card>
          <CardHeader className="text-sm text-slate-400">Bookings</CardHeader>
          <CardContent className="text-2xl font-semibold">184</CardContent>
        </Card>
        <Card>
          <CardHeader className="text-sm text-slate-400">Pending Inquiries</CardHeader>
          <CardContent className="text-2xl font-semibold">12</CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="font-semibold">Recent Payments</CardHeader>
          <CardContent className="space-y-3">
            {payments.isLoading && <Skeleton className="h-28 w-full" />}
            {!payments.isLoading &&
              paymentsList.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold">₹{p.amount.toLocaleString("en-IN")}</p>
                    <p className="text-slate-400 text-xs">{p.id}</p>
                  </div>
                  <Badge
                    variant={
                      p.status === "captured"
                        ? "success"
                        : p.status === "failed"
                        ? "danger"
                        : "muted"
                    }
                  >
                    {p.status}
                  </Badge>
                </div>
              ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="font-semibold">Recent Activity</CardHeader>
          <CardContent className="space-y-3">
            {notifications.isLoading && <Skeleton className="h-28 w-full" />}
            {!notifications.isLoading &&
              notificationsList.map((n) => (
                <div key={n.id} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold">{n.type}</p>
                    <p className="text-slate-400 text-xs">{n.message}</p>
                  </div>
                  <span className="text-xs text-slate-500">{new Date(n.createdAt).toLocaleString()}</span>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;


