"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil, Building2, Search } from "lucide-react";
import { supplierService } from "../../../src/services/supplierService";

const emptyForm = { name: "", email: "", phone: "", contactPerson: "", address: "" };

export default function SuppliersPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => supplierService.getSuppliers(),
  });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editingId
        ? supplierService.updateSupplier(editingId, payload)
        : supplierService.createSupplier(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      setFormOpen(false);
      setEditingId(null);
      setFormData(emptyForm);
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Failed to save supplier");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => supplierService.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
    onError: (error) => {
      alert(error.response?.data?.message || "Failed to delete supplier");
    },
  });

  const openEdit = (supplier) => {
    setEditingId(supplier._id);
    setFormData({
      name: supplier.name,
      email: supplier.email || "",
      phone: supplier.phone || "",
      contactPerson: supplier.contactPerson || "",
      address: supplier.address || "",
    });
    setFormOpen(true);
  };

  const openNew = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setFormOpen(true);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const suppliers = data?.suppliers || [];
  const filtered = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.email || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Suppliers</h1>
          <p className="text-sm text-slate-500">Manage your product suppliers and vendor contacts</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-slate-800 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Supplier
        </button>
      </div>

      {/* Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search suppliers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 w-full text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Form Modal */}
      {formOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-slate-600" />
                {editingId ? "Edit Supplier" : "Add New Supplier"}
              </h3>
              <button
                onClick={() => setFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {[
                { field: "name", label: "Supplier Name", required: true },
                { field: "email", label: "Email Address", required: false },
                { field: "phone", label: "Phone Number", required: false },
                { field: "contactPerson", label: "Contact Person", required: false },
                { field: "address", label: "Address", required: false },
              ].map(({ field, label, required }) => (
                <div key={field}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {label} {required && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    name={field}
                    required={required}
                    value={formData[field]}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              ))}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
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
                  {saveMutation.isPending ? "Saving..." : "Save Supplier"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-sm text-slate-500">
          Loading suppliers...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl py-12 text-center">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Building2 className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">No Suppliers Found</h3>
          <p className="text-xs text-slate-500 mt-1">Add your first supplier to get started.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Supplier</th>
                  <th className="px-6 py-3.5">Email</th>
                  <th className="px-6 py-3.5">Phone</th>
                  <th className="px-6 py-3.5">Contact Person</th>
                  <th className="px-6 py-3.5">Address</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((supplier) => (
                  <tr key={supplier._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{supplier.name}</p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {supplier.email ? (
                        <a href={`mailto:${supplier.email}`} className="hover:underline text-blue-600">
                          {supplier.email}
                        </a>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {supplier.phone || <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {supplier.contactPerson || <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-6 py-4 text-slate-600 max-w-[200px] truncate">
                      {supplier.address || <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEdit(supplier)}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center gap-1 text-xs font-semibold"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Delete this supplier?")) {
                              deleteMutation.mutate(supplier._id);
                            }
                          }}
                          className="p-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-red-600 flex items-center gap-1 text-xs font-semibold"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}