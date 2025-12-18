import React from "react";
import clsx from "clsx";

export const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={clsx("animate-pulse rounded-md bg-slate-800/60", className)} />
);


