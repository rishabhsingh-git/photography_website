import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Toasts } from "../ui/primitives/Toasts";

const adminNav = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/payments", label: "Payments" },
  { to: "/admin/assets", label: "Assets" },
  { to: "/admin/categories", label: "Categories" },
  { to: "/admin/services", label: "Services" },
];

export const AdminLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex">
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-900/60 backdrop-blur">
        <div className="px-6 py-4 text-xl font-semibold tracking-tight">
          Admin Studio
        </div>
        <nav className="flex-1 px-4 space-y-1">
          {adminNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "block rounded-md px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-slate-800 text-slate-50"
                    : "text-slate-300 hover:bg-slate-800/60 hover:text-slate-50",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-slate-800 flex items-center px-4 md:px-6 justify-between bg-slate-950/80 backdrop-blur">
          <span className="text-sm text-slate-400">Cine Stories Admin</span>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <Toasts />
    </div>
  );
};


