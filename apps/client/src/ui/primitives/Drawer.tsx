import React from "react";
import clsx from "clsx";

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  side?: "left" | "right";
  title?: string;
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({ open, onClose, side = "right", title, children }) => {
  return (
    <div
      className={clsx(
        "fixed inset-0 z-50 transition",
        open ? "pointer-events-auto" : "pointer-events-none"
      )}
    >
      <div
        className={clsx(
          "absolute inset-0 bg-black/40 backdrop-blur transition-opacity",
          open ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
      />
      <div
        className={clsx(
          "absolute top-0 h-full w-full max-w-md bg-slate-950 border-l border-slate-800 shadow-2xl transition-transform",
          side === "right" ? "right-0" : "left-0 border-l-0 border-r border-slate-800",
          open ? "translate-x-0" : side === "right" ? "translate-x-full" : "-translate-x-full"
        )}
        role="dialog"
        aria-modal="true"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
          <span className="text-sm font-semibold">{title}</span>
          <button onClick={onClose} aria-label="Close drawer" className="text-slate-300">
            ✕
          </button>
        </div>
        <div className="p-4 overflow-y-auto h-full">{children}</div>
      </div>
    </div>
  );
};


