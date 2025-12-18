import React, { useEffect } from "react";
import clsx from "clsx";
import { useToastStore } from "./ToastStore";

const kindClasses = {
  success: "border-emerald-500/50 bg-emerald-500/10 text-emerald-100",
  error: "border-rose-500/50 bg-rose-500/10 text-rose-100",
  info: "border-sky-500/50 bg-sky-500/10 text-sky-100",
};

export const Toasts: React.FC = () => {
  const { toasts, remove } = useToastStore();

  useEffect(() => {
    const timers = toasts.map((toast) =>
      window.setTimeout(() => remove(toast.id), 4000)
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts, remove]);

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-3">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(
            "min-w-[240px] rounded-xl border px-4 py-3 shadow-xl",
            kindClasses[toast.kind ?? "info"]
          )}
        >
          <div className="text-sm font-semibold">{toast.title}</div>
          {toast.description && (
            <div className="text-xs text-slate-200/80 mt-1">{toast.description}</div>
          )}
        </div>
      ))}
    </div>
  );
};


