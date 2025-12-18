import React, { useState } from "react";
import { usePayments } from "../../hooks/usePayments";
import { Select } from "../../ui/primitives/Select";
import { Table, THead, TBody, TR, TH, TD } from "../../ui/primitives/Table";
import { Skeleton } from "../../ui/skeletons/Skeleton";

const statuses = ["", "created", "captured", "failed"];

const AdminPaymentsPage: React.FC = () => {
  const [status, setStatus] = useState("");
  const { data, isLoading } = usePayments({ status });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Payments</h1>
        <div className="w-48">
          <Select value={status} onChange={(e) => setStatus(e.target.value)}>
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === "" ? "All statuses" : s}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {isLoading && <Skeleton className="h-64 w-full" />}
      {!isLoading && (
        <Table>
          <THead>
            <TR>
              <TH>ID</TH>
              <TH>Status</TH>
              <TH>Amount</TH>
              <TH>Date</TH>
            </TR>
          </THead>
          <TBody>
            {data?.map((p) => (
              <TR key={p.id}>
                <TD className="font-mono text-xs">{p.id}</TD>
                <TD className="capitalize">{p.status}</TD>
                <TD>₹{p.amount.toLocaleString("en-IN")}</TD>
                <TD>{new Date(p.createdAt).toLocaleString()}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  );
};

export default AdminPaymentsPage;


