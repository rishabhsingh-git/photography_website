import React, { Suspense, lazy } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import { MainLayout } from "../layouts/MainLayout";
import { DashboardLayout } from "../layouts/DashboardLayout";
import { AdminLayout } from "../layouts/AdminLayout";
import { RequireAuth } from "../state/RequireAuth";
import { RequireAdmin } from "../state/RequireAdmin";
import { PageSkeleton } from "../ui/skeletons/PageSkeleton";
import { safeString, ensureError } from "../utils/safe";

// Helper: lazy-load with retries and safe error wrapping to avoid throwing unusual values
const lazyWithRetry = (importFn: () => Promise<any>, retries = 2, intervalMs = 500) =>
  lazy(() => {
    let attempts = 0;
    const tryLoad = (): Promise<any> => {
      attempts++;
      console.log(`🔄 [lazyWithRetry] Loading (attempt ${attempts})`);
      return importFn().catch((err) => {
        const s = safeString(err);
        if (attempts <= retries) {
          console.warn(`⚠️ [lazyWithRetry] Load failed, retrying in ${intervalMs}ms (attempt ${attempts})`, s);
          return new Promise((resolve) => setTimeout(resolve, intervalMs)).then(tryLoad);
        }
        console.error(`❌ [lazyWithRetry] Failed after ${attempts} attempts: ${s}`);
        throw ensureError(err);
      });
    };
    return tryLoad();
  });

const LoginPage = lazy(() => import("../views/auth/LoginPage"));
const DashboardPage = lazy(() => import("../views/dashboard/UserDashboardPage"));
const PortfolioPage = lazyWithRetry(() => import("../views/portfolio/PortfolioPage"));

const ServicesPage = lazyWithRetry(() => import("../views/services/ServicesPage"));
const CartPage = lazy(() => import("../views/cart/CartPage"));
const CheckoutPage = lazy(() => import("../views/checkout/CheckoutPage"));
const ContactPage = lazy(() => import("../views/contact/ContactPage"));
const PaymentSuccessPage = lazy(() => import("../views/payment/PaymentSuccessPage"));
const PaymentFailedPage = lazy(() => import("../views/payment/PaymentFailedPage"));

const AdminDashboardPage = lazy(() => import("../views/admin/AdminDashboardPage"));
const AdminUsersPage = lazy(() => import("../views/admin/AdminUsersPage"));
const AdminPaymentsPage = lazy(() => import("../views/admin/AdminPaymentsPage"));
const AdminAssetsPage = lazy(() => import("../views/admin/AdminAssetsPage"));
const AdminCategoriesPage = lazy(() => import("../views/admin/AdminCategoriesPage"));
const AdminServicesPage = lazy(() => import("../views/admin/AdminServicesPage"));

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/auth/login" element={<LoginPage />} />
          <Route
            path="/dashboard"
            element={
              <DashboardLayout>
                <DashboardPage />
              </DashboardLayout>
            }
          />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/failed" element={<PaymentFailedPage />} />
          <Route path="/contact" element={<ContactPage />} />
        </Route>

        <Route
          path="/admin"
          element={
            <RequireAuth>
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="payments" element={<AdminPaymentsPage />} />
          <Route path="assets" element={<AdminAssetsPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="services" element={<AdminServicesPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
};


