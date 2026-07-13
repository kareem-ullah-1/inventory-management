"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Truck,
  History,
  Settings,
  LogOut,
  Boxes,
  Users,
  Receipt,
  ShoppingCart,
  BarChart3,
  Search,
  Scan,
  ShieldCheck,
  X,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

export default function Sidebar({ open = false, onClose = () => {} }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isActive = (href) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const navGroups = [
    {
      title: "Core",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Advanced Search", href: "/dashboard/search", icon: Search },
      ],
    },
    {
      title: "Inventory",
      items: [
        { label: "Products", href: "/dashboard/products", icon: Package },
        { label: "Categories", href: "/dashboard/categories", icon: FolderTree },
        { label: "Suppliers", href: "/dashboard/suppliers", icon: Truck },
        { label: "Stock Logs", href: "/dashboard/stock-logs", icon: History },
        { label: "Barcode Scanner", href: "/dashboard/scanner", icon: Scan },
      ],
    },
    {
      title: "Sales & Purchases",
      items: [
        { label: "Sales / Orders", href: "/dashboard/sales", icon: Receipt },
        { label: "Customers", href: "/dashboard/customers", icon: Users },
        { label: "Purchase Orders", href: "/dashboard/purchase-orders", icon: ShoppingCart },
        { label: "Reports & Analytics", href: "/dashboard/reports", icon: BarChart3 },
        // { label: "AI Forecast", href: "/dashboard/ai-forecast", icon: BarChart3 },
      ],
    },
    {
      title: "Admin Panel",
      role: "admin",
      items: [
        { label: "User Directory", href: "/dashboard/users", icon: Users },
        { label: "Audit Logs", href: "/dashboard/audit-logs", icon: ShieldCheck },
      ],
    },
    {
      title: "System",
      items: [
        { label: "Settings", href: "/dashboard/settings", icon: Settings },
      ],
    },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`w-64 shrink-0 bg-slate-900 text-slate-300 flex flex-col h-screen overflow-y-auto
          fixed top-0 left-0 z-50 transition-transform duration-200 ease-in-out
          lg:sticky lg:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
      {/* Brand logo */}
      <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
          <Boxes className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="font-bold text-white tracking-wide text-lg">StockFlow</span>
          <span className="text-[10px] block text-emerald-400 font-medium leading-none">v1.1 Enterprise</span>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation menu */}
      <nav className="flex-1 px-4 py-6 space-y-6">
        {navGroups.map((group) => {
          // Check role restrictions
          if (group.role === "admin" && user?.role !== "admin") {
            return null;
          }

          return (
            <div key={group.title} className="space-y-1.5">
              <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-3">
                {group.title}
              </h4>
              <div className="space-y-0.5">
                {group.items.map(({ label, href, icon: Icon }) => {
                  const active = isActive(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={onClose}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        active
                          ? "bg-emerald-600 text-white shadow-sm shadow-emerald-900/30"
                          : "text-slate-400 hover:bg-slate-800 hover:text-white"
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${active ? "text-white" : "text-slate-400 group-hover:text-white"}`} />
                      <span>{label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      {/* User profile & Logout */}
      <div className="p-4 border-t border-slate-850 bg-slate-950 shrink-0">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 rounded-full bg-emerald-600/25 border border-emerald-500/35 flex items-center justify-center font-semibold text-emerald-400">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name || "Inventory Staff"}</p>
            <p className="text-[10px] text-slate-500 uppercase font-medium tracking-wide">{user?.role || "Staff"}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-950/20 border border-red-950/10 hover:border-red-500/20 hover:text-red-300 transition-all"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
      </aside>
    </>
  );
}
