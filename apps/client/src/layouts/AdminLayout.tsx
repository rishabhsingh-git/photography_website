import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { Toasts } from "../ui/primitives/Toasts";
import { useAuthContext } from "../state/AuthProvider";
import { Button } from "../ui/primitives/Button";

const adminNav = [
  { to: "/admin/dashboard", label: "Dashboard" },
  { to: "/admin/users", label: "Clients" },
  { to: "/admin/payments", label: "Payments" },
  { to: "/admin/assets", label: "Assets" },
  { to: "/admin/services", label: "Services" },
];

export const AdminLayout: React.FC = () => {
  const { logout, user } = useAuthContext();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/auth/login", { replace: true });
  };

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
        <div className="px-4 py-4 border-t border-slate-800">
          <div className="mb-3 flex items-center gap-3 px-3 py-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-pink-500 via-amber-400 to-sky-500 flex items-center justify-center text-white font-semibold text-sm">
              {user?.email?.charAt(0).toUpperCase() || "A"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-300 font-medium truncate">
                {user?.name || user?.email || "Admin"}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="w-full"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-slate-800 flex items-center px-4 md:px-6 justify-between bg-slate-950/80 backdrop-blur">
          <span className="text-sm text-slate-400">Cine Stories Admin</span>
          <div className="md:hidden flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-pink-500 via-amber-400 to-sky-500 flex items-center justify-center text-white font-semibold text-xs">
              {user?.email?.charAt(0).toUpperCase() || "A"}
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
      <Toasts />
    </div>
  );
};


