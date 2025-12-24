import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AppRoutes } from "./routes/AppRoutes";
import { AuthProvider } from "./state/AuthProvider";
import { AppErrorBoundary } from "./ui/errors/AppErrorBoundary";
import { addToast } from "./ui/primitives/ToastStore";
import { safeString } from "./utils/safe";
import "./utils/cacheBuster"; // Import cache-busting utilities for development
import "./index.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // In development, disable caching to see changes immediately
      staleTime: import.meta.env.DEV ? 0 : 1000 * 60,
      // React Query v5 uses gcTime instead of cacheTime
      gcTime: import.meta.env.DEV ? 0 : 5 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      retry: 2,
    },
    mutations: {
      retry: 1,
    },
  },
});

// Global error handlers to catch chunk load failures and unhandled rejections
if (typeof window !== "undefined") {
  window.addEventListener("error", (event) => {
    try {
      const desc = safeString(event.error ?? event.message);
      console.error("🌍 [Global Error]", desc, event);
      addToast({ title: "Unexpected error", description: desc, kind: "error" });

      const msg = safeString(event?.message || "");
      if (/loading chunk/i.test(msg) || /Loading chunk/.test(msg)) {
        console.error("⚠️ [Global Error] Possible chunk load failure detected — try a hard reload (Ctrl+F5)");
      }
    } catch (err) {
      console.error('⚠️ [Global handler] failed', err);
    }
  });

  window.addEventListener("unhandledrejection", (event) => {
    try {
      const r = safeString(event.reason ?? "Unknown");
      console.error("🌍 [Unhandled Rejection]", r);
      addToast({ title: "Unhandled rejection", description: r, kind: "error" });
    } catch (err) {
      console.error('⚠️ [Global handler] failed', err);
    }
  });
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <AppErrorBoundary>
            <AppRoutes />
          </AppErrorBoundary>
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </React.StrictMode>
);


