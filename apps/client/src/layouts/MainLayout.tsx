import React from "react";
import { Outlet } from "react-router-dom";
import { Header } from "../ui/layout/Header";
import { Footer } from "../ui/layout/Footer";
import { Toasts } from "../ui/primitives/Toasts";

export const MainLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-50">
      <Header />
      <main className="flex-1 pt-16">
        <Outlet />
      </main>
      <Footer />
      <Toasts />
    </div>
  );
};


