import React, { useState } from "react";
import { useUsers } from "../../hooks/useUsers";
import { useDebouncedSearch } from "../../hooks/useDebouncedSearch";
import { Input } from "../../ui/primitives/Input";
import { Table, THead, TBody, TR, TH, TD } from "../../ui/primitives/Table";
import { Skeleton } from "../../ui/skeletons/Skeleton";
import { Card, CardContent } from "../../ui/primitives/Card";
import { Badge } from "../../ui/primitives/Badge";
import { Drawer } from "../../ui/primitives/Drawer";

const AdminUsersPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const debounced = useDebouncedSearch(search, 300);
  const { data, isLoading } = useUsers(debounced);
  const [selected, setSelected] = useState<string | null>(null);

  const selectedUser = data?.find((u) => u.id === selected);

  // Filter to show only clients (non-admin users who made payments or submitted contact forms)
  // Show users who have made payments (paymentCount > 0) or are non-admin users
  const clients = data?.filter((u) => {
    const hasPayments = (u as any).paymentCount > 0;
    const isNotAdmin = !u.roles?.includes("admin");
    // Show users who have payments OR are non-admin (potential contact form submitters)
    return hasPayments || (isNotAdmin && (u.email || (u as any).phone || u.name));
  }) || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">Clients</h1>
          <p className="text-slate-400 text-sm mt-1">Manage all clients and their payment details</p>
        </div>
        <div className="w-64">
          <Input 
            placeholder="Search by name, email, or phone..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading && <Skeleton className="h-64 w-full" />}
          {!isLoading && clients.length === 0 && (
            <div className="text-center py-10">
              <p className="text-slate-400">No clients found</p>
            </div>
          )}
          {!isLoading && clients.length > 0 && (
            <Table>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Email</TH>
                  <TH>Phone</TH>
                  <TH>Address</TH>
                  <TH>Total Paid</TH>
                  <TH>Payments</TH>
                  <TH>Created</TH>
                  <TH>Actions</TH>
                </TR>
              </THead>
              <TBody>
                {clients.map((user) => {
                  const userData = user as any;
                  return (
                    <TR key={user.id} className="hover:bg-slate-800/50">
                      <TD className="font-semibold">{user.name ?? "Guest User"}</TD>
                      <TD className="text-slate-300">{user.email}</TD>
                      <TD className="text-slate-400">{user.phone || "—"}</TD>
                      <TD className="text-slate-400 text-sm max-w-xs truncate">
                        {userData.address || "—"}
                      </TD>
                      <TD className="text-green-400 font-semibold">
                        ₹{userData.totalPaidAmount?.toLocaleString("en-IN") || "0"}
                      </TD>
                      <TD className="text-slate-400">
                        {userData.paidPaymentCount || 0} / {userData.paymentCount || 0}
                      </TD>
                      <TD className="text-slate-400 text-sm">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
                      </TD>
                      <TD>
                        <button
                          onClick={() => setSelected(user.id)}
                          className="text-sky-400 hover:text-sky-300 text-sm"
                        >
                          View Details
                        </button>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Drawer open={!!selected} onClose={() => setSelected(null)} title="Client Details">
        {selectedUser && (
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-slate-400 mb-1">Name</p>
              <p className="font-semibold text-lg text-slate-50">{selectedUser.name ?? selectedUser.email}</p>
            </div>
            <div>
              <p className="text-slate-400 mb-1">Email</p>
              <p className="text-slate-300">{selectedUser.email}</p>
            </div>
            {(selectedUser as any).phone && (
              <div>
                <p className="text-slate-400 mb-1">Phone</p>
                <p className="text-slate-300">{(selectedUser as any).phone}</p>
              </div>
            )}
            {(selectedUser as any).address && (
              <div>
                <p className="text-slate-400 mb-1">Address</p>
                <p className="text-slate-300">{(selectedUser as any).address}</p>
              </div>
            )}
            <div>
              <p className="text-slate-400 mb-1">Total Amount Paid</p>
              <p className="text-slate-50 font-semibold text-lg text-green-400">
                ₹{((selectedUser as any).totalPaidAmount || 0).toLocaleString("en-IN")}
              </p>
            </div>
            <div>
              <p className="text-slate-400 mb-1">Payment History</p>
              <div className="space-y-2 mt-2">
                {((selectedUser as any).payments || []).length === 0 ? (
                  <p className="text-slate-400 text-xs">No payments yet</p>
                ) : (
                  ((selectedUser as any).payments || []).map((payment: any) => (
                    <div key={payment.id} className="bg-slate-800/50 rounded-lg p-3 space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-300 font-semibold">₹{payment.amount.toLocaleString("en-IN")}</span>
                        <Badge variant={payment.status === "paid" ? "success" : "muted"}>
                          {payment.status}
                        </Badge>
                      </div>
                      <p className="text-slate-400 text-xs">Order: {payment.orderId}</p>
                      {payment.paymentId && (
                        <p className="text-slate-400 text-xs">Payment ID: {payment.paymentId}</p>
                      )}
                      <p className="text-slate-500 text-xs">
                        {new Date(payment.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
            <div>
              <p className="text-slate-400 mb-1">Joined</p>
              <p className="text-slate-300">
                {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : "—"}
              </p>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default AdminUsersPage;
