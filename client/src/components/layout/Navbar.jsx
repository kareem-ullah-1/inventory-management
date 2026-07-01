"use client";

import { useAuth } from "../../context/AuthContext";
import NotificationDropdown from "../notifications/NotificationDropdown";

export default function Navbar() {
  const { user } = useAuth();

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
      <div>
        <h2 className="text-sm font-semibold text-slate-800 hidden md:block">
          Enterprise Resource Inventory Planner
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <NotificationDropdown />

        <div className="h-6 w-[1px] bg-slate-200" />

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-medium">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-slate-900 leading-tight">
              {user?.name || "Inventory User"}
            </p>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider leading-none">
              {user?.role || "Staff"}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
