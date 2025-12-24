import React from "react";
import clsx from "clsx";

export const Table: React.FC<{ className?: string; children: React.ReactNode }> = ({
  className,
  children,
}) => (
  <div className="w-full overflow-x-auto rounded-2xl border border-slate-800">
    <table className={clsx("w-full text-sm text-left text-slate-200", className)}>{children}</table>
  </div>
);

export const THead: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <thead className="bg-slate-900/80 text-xs uppercase text-slate-400">{children}</thead>
);
export const TBody: React.FC<{ children: React.ReactNode }> = ({ children }) => <tbody>{children}</tbody>;
export const TR: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <tr className={clsx("border-b border-slate-800 last:border-0 hover:bg-slate-900/50", className)}>{children}</tr>
);
export const TH: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <th scope="col" className={clsx("px-4 py-3", className)}>
    {children}
  </th>
);
export const TD: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <td className={clsx("px-4 py-3", className)}>{children}</td>
);


