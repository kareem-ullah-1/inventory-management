import ProtectedRoute from "../../src/components/layout/ProtectedRoute";
import Sidebar from "../../src/components/layout/Sidebar";
import Navbar from "../../src/components/layout/Navbar";
import AIChatWidget from "../../src/components/layout/AIChatWidget";

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <main className="flex-1 p-6">{children}</main>
        </div>
      </div>
      <AIChatWidget />
    </ProtectedRoute>
  );
}