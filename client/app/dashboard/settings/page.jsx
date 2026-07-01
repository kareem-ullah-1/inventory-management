"use client";

import { useState } from "react";
import { useAuth } from "../../../src/context/AuthContext";
import { authService } from "../../../src/services/authService";
import {
  User, Mail, Shield, KeyRound, Bell, Palette,
  Eye, EyeOff, CheckCircle2, AlertCircle, Settings,
  Building2, Clock, Globe
} from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [formData, setFormData] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (formData.newPassword !== formData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (formData.newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    try {
      await authService.updatePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });
      setMessage("Password updated successfully");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update password");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: KeyRound },
    { id: "system", label: "System", icon: Settings },
  ];

  const roleColors = {
    admin: "bg-purple-100 text-purple-700 border-purple-200",
    manager: "bg-blue-100 text-blue-700 border-blue-200",
    staff: "bg-emerald-100 text-emerald-700 border-emerald-200",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Account Settings</h1>
        <p className="text-sm text-slate-500">Manage your profile, security, and system preferences</p>
      </div>

      <div className="flex gap-6 items-start">
        {/* Sidebar Tabs */}
        <div className="w-48 shrink-0 bg-white border border-slate-200 rounded-xl p-2 shadow-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                activeTab === tab.id
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 space-y-4">

          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-4">
              {/* Avatar + Name Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-5">
                  <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center shrink-0">
                    <span className="text-2xl font-black text-white">
                      {user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
                    <p className="text-sm text-slate-500">{user?.email}</p>
                    <span className={`inline-flex items-center gap-1 mt-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold border capitalize ${roleColors[user?.role] || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                      <Shield className="w-3 h-3" />
                      {user?.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info Grid */}
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Account Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: User, label: "Full Name", value: user?.name },
                    { icon: Mail, label: "Email Address", value: user?.email },
                    { icon: Shield, label: "Access Role", value: user?.role, capitalize: true },
                    { icon: CheckCircle2, label: "Account Status", value: user?.isActive ? "Active" : "Inactive", color: user?.isActive ? "text-emerald-600" : "text-red-600" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                        <item.icon className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase">{item.label}</p>
                        <p className={`text-sm font-semibold mt-0.5 capitalize ${item.color || "text-slate-800"}`}>
                          {item.value || "—"}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-5">
                <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-slate-500" />
                  Change Password
                </h3>

                {message && (
                  <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-lg px-4 py-3">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    {message}
                  </div>
                )}
                {error && (
                  <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {[
                    { name: "currentPassword", label: "Current Password", show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
                    { name: "newPassword", label: "New Password", show: showNew, toggle: () => setShowNew(!showNew) },
                    { name: "confirmPassword", label: "Confirm New Password", show: showNew, toggle: () => setShowNew(!showNew) },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">{field.label}</label>
                      <div className="relative">
                        <input
                          name={field.name}
                          type={field.show ? "text" : "password"}
                          required
                          value={formData[field.name]}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                        <button
                          type="button"
                          onClick={field.toggle}
                          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                        >
                          {field.show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Password strength hint */}
                  {formData.newPassword && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-slate-500">Password strength</p>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((level) => {
                          const len = formData.newPassword.length;
                          const hasUpper = /[A-Z]/.test(formData.newPassword);
                          const hasNum = /[0-9]/.test(formData.newPassword);
                          const hasSpecial = /[^A-Za-z0-9]/.test(formData.newPassword);
                          const score = [len >= 6, hasUpper, hasNum, hasSpecial].filter(Boolean).length;
                          return (
                            <div key={level} className={`h-1.5 flex-1 rounded-full ${
                              level <= score
                                ? score <= 1 ? "bg-red-400" : score <= 2 ? "bg-amber-400" : score <= 3 ? "bg-blue-400" : "bg-emerald-500"
                                : "bg-slate-200"
                            }`} />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-slate-900 text-white text-sm font-semibold rounded-lg px-5 py-2.5 hover:bg-slate-800 disabled:opacity-60 transition"
                  >
                    {loading ? "Updating..." : "Update Password"}
                  </button>
                </form>
              </div>

              {/* Security Info */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-800 font-medium space-y-1">
                <p className="font-bold text-amber-900">Password Security Tips</p>
                <p>• Use at least 8 characters with uppercase, numbers, and symbols</p>
                <p>• Never share your password with anyone</p>
                <p>• Change your password regularly for better security</p>
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === "system" && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-slate-500" />
                  System Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { icon: Building2, label: "Application", value: "StockFlow IMS" },
                    { icon: Globe, label: "Version", value: "v1.0.0" },
                    { icon: Clock, label: "Timezone", value: Intl.DateTimeFormat().resolvedOptions().timeZone },
                    { icon: Settings, label: "Environment", value: "Production" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg">
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                        <item.icon className="w-4 h-4 text-slate-500" />
                      </div>
                      <div>
                        <p className="text-[10px] font-semibold text-slate-400 uppercase">{item.label}</p>
                        <p className="text-sm font-semibold text-slate-800 mt-0.5">{item.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-3">
                <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2 flex items-center gap-2">
                  <Bell className="w-4 h-4 text-slate-500" />
                  AI Features Status
                </h3>
                {[
                  { label: "AI Chat Assistant", status: "Active", color: "emerald" },
                  { label: "AI Demand Forecasting", status: "Active", color: "emerald" },
                  { label: "Inventory Health Analysis", status: "Active", color: "emerald" },
                  { label: "Sales Trend Prediction", status: "Active", color: "emerald" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <span className="text-sm text-slate-700 font-medium">{item.label}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold bg-${item.color}-100 text-${item.color}-700 border border-${item.color}-200`}>
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}