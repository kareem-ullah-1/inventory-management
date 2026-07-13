"use client";

import { useState } from "react";
import ProtectedRoute from "../../src/components/layout/ProtectedRoute";
import Sidebar from "../../src/components/layout/Sidebar";
import Navbar from "../../src/components/layout/Navbar";
import AIChatWidget from "../../src/components/layout/AIChatWidget";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ProtectedRoute>
      <div className="min-h-screen flex bg-slate-50">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar onMenuClick={() => setSidebarOpen(true)} />
          <main className="flex-1 p-4 sm:p-6 overflow-x-hidden">{children}</main>
        </div>
      </div>
      <AIChatWidget />
    </ProtectedRoute>
  );
}