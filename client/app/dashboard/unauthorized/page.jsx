"use client";

import { ShieldAlert, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center space-y-6">
      <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center shadow-inner border border-red-150 animate-bounce">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <div className="space-y-2 max-w-md">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Access Restrictions Enforced</h1>
        <p className="text-sm text-slate-500">
          Your credentials do not possess the authorization clearance levels required to access this system module. Please contact your system administrator if this is in error.
        </p>
      </div>

      <div className="flex gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 bg-slate-900 text-white text-xs font-bold px-4 py-2.5 rounded-lg hover:bg-slate-800 transition shadow-sm"
        >
          <Home className="w-4 h-4" />
          Dashboard Home
        </Link>
        <button
          onClick={() => {
            if (typeof window !== "undefined") window.history.back();
          }}
          className="flex items-center gap-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-lg transition"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400" />
          Go Back
        </button>
      </div>
    </div>
  );
}
