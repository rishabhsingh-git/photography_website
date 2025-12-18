import React from "react";
import clsx from "clsx";

export const Card: React.FC<{
  className?: string;
  children: React.ReactNode;
}> = ({ className, children }) => {
  return (
    <div className={clsx("rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur", className)}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => (
  <div className={clsx("px-5 py-4 border-b border-slate-800", className)}>{children}</div>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className,
}) => <div className={clsx("px-5 py-4", className)}>{children}</div>;


