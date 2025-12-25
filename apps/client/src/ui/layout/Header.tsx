import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useMobileMenuStore } from "../../state/useMobileMenuStore";
import { Logo } from "./Logo";

const navItems = [
  { to: "/portfolio", label: "Portfolio" },
  { to: "/services", label: "Services" },
  { to: "/cart", label: "Cart" },
  { to: "/contact", label: "Contact" },
];

export const Header: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { isOpen, toggle, close } = useMobileMenuStore();

  const handleAuthAction = async () => {
    const { logout, isAuthenticated } = useAuth();
    if (isAuthenticated) {
      await logout();
    } else {
      navigate("/auth/login");
    }
  };

  const AuthArea: React.FC = () => {
    const { isAdmin } = useAuth();
    // Only show Admin link for admins, no logout button for end users
    if (isAdmin) {
      return (
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) =>
            [
              "px-3 py-1.5 rounded-full border border-slate-700 transition-colors text-sm font-medium",
              isActive ? "bg-slate-800 text-slate-50" : "text-slate-50 bg-transparent hover:bg-slate-900",
            ].join(" ")
          }
        >
          Admin
        </NavLink>
      );
    }
    // Non-admin authenticated users - no logout button (only login button for guests)
    return null;
  };

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 ml-[10px]">
          <Logo />
        </div>
        <nav className="hidden md:flex items-center gap-4 text-sm">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  "px-3 py-1.5 rounded-full border border-transparent transition-colors text-sm",
                  isActive
                    ? "bg-slate-800 text-slate-50 border-slate-700"
                    : "text-slate-300 hover:text-slate-50 hover:border-slate-700 hover:bg-slate-900",
                ].join(" ")
              }
            >
              {item.label}
            </NavLink>
          ))}

          {/* For guests show Login button; ensure admin login flow is reachable */}
          {!isAuthenticated && (
            <NavLink
              to="/auth/login"
              className={({ isActive }) =>
                [
                  "px-3 py-1.5 rounded-full border border-slate-700 transition-colors text-sm font-medium",
                  isActive
                    ? "bg-slate-800 text-slate-50"
                    : "text-slate-50 bg-transparent hover:bg-slate-900",
                ].join(" ")
              }
            >
              Login
            </NavLink>
          )}

          {/* Show Dashboard only for authenticated admins; otherwise show Logout for authenticated users */}
          {isAuthenticated && <AuthArea />}
        </nav>
        <button
          aria-label="Toggle navigation"
          className="md:hidden inline-flex items-center justify-center rounded-full border border-slate-700 h-9 w-9 text-slate-200"
          onClick={toggle}
        >
          <span className="sr-only">Toggle navigation menu</span>
          <div className="space-y-1.5">
            <span className="block h-0.5 w-5 bg-slate-200" />
            <span className="block h-0.5 w-5 bg-slate-200" />
          </div>
        </button>
      </div>
      {isOpen && (
        <div
          className="md:hidden bg-slate-950/95 border-t border-slate-800"
          role="dialog"
          aria-modal="true"
        >
          <div className="px-4 py-3 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={close}
                className={({ isActive }) =>
                  [
                    "block px-2 py-1 rounded-md text-sm",
                    isActive
                      ? "bg-slate-800 text-slate-50"
                      : "text-slate-300 hover:bg-slate-900 hover:text-slate-50",
                  ].join(" ")
                }
              >
                {item.label}
              </NavLink>
            ))}
            {!isAuthenticated && (
              <NavLink
                to="/auth/login"
                onClick={close}
                className={({ isActive }) =>
                  [
                    "block px-2 py-1 rounded-md text-sm",
                    isActive
                      ? "bg-slate-800 text-slate-50"
                      : "text-slate-300 hover:bg-slate-900 hover:text-slate-50",
                  ].join(" ")
                }
              >
                Login
              </NavLink>
            )}
            {isAuthenticated && (
              <>
                {/* Show admin dashboard link only for admins */}
                {/* @ts-ignore */}
                {useAuth().isAdmin ? (
                  <NavLink
                    to="/admin/dashboard"
                    onClick={close}
                    className={({ isActive }) =>
                      [
                        "block px-2 py-1 rounded-md text-sm",
                        isActive
                          ? "bg-slate-800 text-slate-50"
                          : "text-slate-300 hover:bg-slate-900 hover:text-slate-50",
                      ].join(" ")
                    }
                  >
                    Admin
                  </NavLink>
                ) : null}
                {/* No logout button for end users */}
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};


