import { create } from "zustand";

type ToastKind = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  kind?: ToastKind;
}

interface ToastState {
  toasts: ToastMessage[];
  add: (toast: Omit<ToastMessage, "id">) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  add: (toast) =>
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id: crypto.randomUUID() }],
    })),
  remove: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));


