"use client";

import { useState } from "react";
import { useAuth } from "../../../src/context/AuthContext";
import { useUsers, useSaveUser, useDeleteUser } from "../../../src/hooks/useUsers";
import { Plus, Search, Shield, User, Trash2, Mail, BadgeAlert } from "lucide-react";
import SkeletonLoader from "../../../src/components/layout/SkeletonLoader";
import { formatDate } from "../../../src/utils/formatDate";
import { toast } from "../../../src/components/layout/Toast";

const emptyForm = { name: "", email: "", role: "staff", status: "active" };

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const { data, isLoading } = useUsers();
  const saveMutation = useSaveUser(editingId);
  const deleteMutation = useDeleteUser();

  const users = data?.users || [];

  // Protect path: Render access denied if not Admin
  if (currentUser && currentUser.role !== "admin") {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center max-w-md mx-auto my-12 space-y-4">
        <div className="w-12 h-12 bg-red-50 text-red-650 rounded-full flex items-center justify-center mx-auto">
          <BadgeAlert className="w-6 h-6" />
        </div>
        <h2 className="text-base font-black text-slate-900">Access Restricted</h2>
        <p className="text-xs text-slate-500">
          Only administrators are authorized to access role configurations and user directories.
        </p>
      </div>
    );
  }

  const handleOpenNew = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setFormOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingId(user._id);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status || "active",
    });
    setFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) {
      toast.error("All asterisk fields are required");
      return;
    }

    saveMutation.mutate(formData, {
      onSuccess: () => {
        toast.success(editingId ? "User modifications saved" : "New user created");
        setFormOpen(false);
      },
      onError: (err) => {
        toast.error("Failed to save user account");
      },
    });
  };

  const handleDelete = (id, name) => {
    if (id === currentUser._id) {
      toast.error("You cannot delete your own admin account");
      return;
    }

    if (confirm(`Confirm deletion of user "${name}"?`)) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast.success("User account deactivated");
        },
        onError: () => {
          toast.error("Failed to delete user");
        },
      });
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Users & Roles</h1>
          <p className="text-sm text-slate-500">Manage employee accounts, set permission roles, and review status directories</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-slate-800 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add New User
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* User Table Grid */}
      {isLoading ? (
        <div className="bg-white p-6 border border-slate-200 rounded-xl">
          <SkeletonLoader variant="table" cols={5} />
        </div>
      ) : filteredUsers.length === 0 ? (
        <p className="text-slate-550 text-sm py-12 text-center">No system users found matching filters.</p>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-655 text-[11px] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Name</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Account Status</th>
                  <th className="px-6 py-3.5">Date Created</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const isAdmin = u.role === "admin";
                  return (
                    <tr key={u._id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4 font-bold text-slate-905">{u.name}</td>
                      <td className="px-6 py-4 text-slate-600">
                        <span className="flex items-center gap-1.5">
                          <Mail className="w-4 h-4 text-slate-400" />
                          {u.email}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            isAdmin
                              ? "bg-purple-50 text-purple-750 border border-purple-100"
                              : "bg-slate-100 text-slate-700 border border-slate-200"
                          }`}
                        >
                          {isAdmin ? (
                            <Shield className="w-3 h-3 text-purple-600" />
                          ) : (
                            <User className="w-3 h-3 text-slate-500" />
                          )}
                          {u.role === "admin" ? "Admin" : "Staff"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full text-xs font-bold border border-emerald-100">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{formatDate(u.createdAt)}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2.5">
                          <button
                            onClick={() => handleOpenEdit(u)}
                            className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(u._id, u.name)}
                            disabled={u._id === currentUser?._id}
                            className="p-1.5 rounded-lg text-red-500 hover:text-red-750 hover:bg-red-50 disabled:opacity-20 transition"
                            title="Deactivate Account"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* User Form Modal */}
      {formOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-150 px-5 py-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-900">{editingId ? "Modify Account Details" : "Register Employee"}</h3>
              <button
                onClick={() => setFormOpen(false)}
                className="text-slate-400 hover:text-slate-655 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Employee Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="e.g. David Miller"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full text-sm px-3.5 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
                  placeholder="e.g. david@stockflow.com"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">System Role Permissions *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                >
                  <option value="staff">Staff (Sales, Restock, Scanner)</option>
                  <option value="admin">Administrator (All Access Controls)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="text-xs font-semibold text-slate-600 px-4 py-2 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveMutation.isPending}
                  className="bg-slate-900 text-white text-xs font-semibold rounded-lg px-4 py-2 hover:bg-slate-800 disabled:opacity-60"
                >
                  {saveMutation.isPending ? "Processing..." : "Confirm Account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
