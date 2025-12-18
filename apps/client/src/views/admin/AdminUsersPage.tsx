import React, { useState } from "react";
import { useUsers } from "../../hooks/useUsers";
import { useDebouncedSearch } from "../../hooks/useDebouncedSearch";
import { Input } from "../../ui/primitives/Input";
import { Table, THead, TBody, TR, TH, TD } from "../../ui/primitives/Table";
import { Skeleton } from "../../ui/skeletons/Skeleton";
import { Drawer } from "../../ui/primitives/Drawer";

const AdminUsersPage: React.FC = () => {
  const [search, setSearch] = useState("");
  const debounced = useDebouncedSearch(search, 300);
  const { data, isLoading } = useUsers(debounced);
  const [selected, setSelected] = useState<string | null>(null);

  const selectedUser = data?.find((u) => u.id === selected);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Users</h1>
        <div className="w-64">
          <Input placeholder="Search users" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
      </div>

      {isLoading && <Skeleton className="h-64 w-full" />}
      {!isLoading && (
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Email</TH>
              <TH>Roles</TH>
              <TH>Created</TH>
            </TR>
          </THead>
          <TBody>
            {data?.map((user) => (
              <TR key={user.id} onClick={() => setSelected(user.id)} className="cursor-pointer">
                <TD>{user.name ?? "—"}</TD>
                <TD>{user.email}</TD>
                <TD>{user.roles?.join(", ")}</TD>
                <TD>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}

      <Drawer open={!!selected} onClose={() => setSelected(null)} title="User details">
        {selectedUser && (
          <div className="space-y-2 text-sm">
            <p className="font-semibold text-lg">{selectedUser.name ?? selectedUser.email}</p>
            <p className="text-slate-400">{selectedUser.email}</p>
            <p className="text-slate-300">Roles: {selectedUser.roles?.join(", ") ?? "user"}</p>
            <p className="text-slate-300">
              Joined: {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleString() : "—"}
            </p>
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default AdminUsersPage;


