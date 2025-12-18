import React from "react";
import clsx from "clsx";

type Variant = "default" | "success" | "warning" | "danger" | "muted";

const styles: Record<Variant, string> = {
  default: "bg-slate-800 text-slate-100",
  success: "bg-emerald-500/20 text-emerald-200 border border-emerald-500/40",
  warning: "bg-amber-500/20 text-amber-100 border border-amber-500/40",
  danger: "bg-rose-500/20 text-rose-100 border border-rose-500/40",
  muted: "bg-slate-800 text-slate-300",
};

export const Badge: React.FC<{
  children: React.ReactNode;
  variant?: Variant;
  className?: string;
}> = ({ children, variant = "default", className }) => (
  <span className={clsx("inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold", styles[variant], className)}>
    {children}
  </span>
);


