import React from "react";
import clsx from "clsx";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  loading?: boolean;
}

const base =
  "inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-400 focus-visible:ring-offset-slate-950 disabled:opacity-60 disabled:cursor-not-allowed";

const variantStyles: Record<Variant, string> = {
  primary: "bg-sky-500 text-slate-950 hover:bg-sky-400",
  secondary: "bg-slate-800 text-slate-50 hover:bg-slate-700",
  ghost: "bg-transparent text-slate-50 hover:bg-slate-800",
  danger: "bg-rose-500 text-slate-50 hover:bg-rose-400",
};

const sizeStyles: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-4 py-2 text-sm",
  lg: "px-5 py-2.5 text-base",
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  block,
  loading,
  className,
  children,
  ...rest
}) => {
  return (
    <button
      className={clsx(base, variantStyles[variant], sizeStyles[size], block && "w-full", className)}
      disabled={rest.disabled || loading}
      {...rest}
    >
      {loading && (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-transparent" />
      )}
      {children}
    </button>
  );
};


