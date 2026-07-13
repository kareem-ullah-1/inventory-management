"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Pencil, Trash2, Mail, Phone, MapPin, Eye, Users, X } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "../../../src/utils/formatCurrency";
import axiosInstance from "../../../src/lib/axios";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  type: "individual",
  companyName: "",
  creditLimit: 0,
  note: "",
  address: {
    street: "",
    city: "",
    state: "",
    country: "Pakistan",
    postalCode: "",
  },
};

const formatAddress = (address) => {
  if (!address) return "No address listed";
  if (typeof address === "string") return address || "No address listed";
  const { street, city, state, country, postalCode } = address;
  return [street, city, state, country, postalCode].filter(Boolean).join(", ") || "No address listed";
};

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ["customers", search],
    queryFn: async () => {
      const res = await axiosInstance.get("/customers", { params: { search, limit: 100 } });
      return res.data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editingId
        ? axiosInstance.put(`/customers/${editingId}`, payload)
        : axiosInstance.post("/customers", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setFormOpen(false);
      setEditingId(null);
      setFormData(emptyForm);
      setFormErrors({});
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => axiosInstance.delete(`/customers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      setDeleteTarget(null);
    },
  });

  const openNew = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setFormErrors({});
    setFormOpen(true);
  };

  const openEdit = (customer) => {
    setEditingId(customer._id);
    setFormData({
      name:        customer.name        || "",
      email:       customer.email       || "",
      phone:       customer.phone       || "",
      type:        customer.type        || "individual",
      companyName: customer.companyName || "",
      creditLimit: customer.creditLimit || 0,
      note:        customer.note        || "",
      address: {
        street:     customer.address?.street     || "",
        city:       customer.address?.city       || "",
        state:      customer.address?.state      || "",
        country:    customer.address?.country    || "Pakistan",
        postalCode: customer.address?.postalCode || "",
      },
    });
    setFormErrors({});
    setFormOpen(true);
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: { ...prev.address, [name]: value },
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Customer name is required";
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    saveMutation.mutate(formData);
  };

  const customers = data?.customers || [];

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500">Manage customer accounts and purchase history</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center justify-center gap-2 bg-slate-900 text-white text-sm font-medium rounded-md px-4 py-2 hover:bg-slate-800 transition"
        >
          <Plus className="w-4 h-4" />
          Add Customer
        </button>
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email or phone..."
          className="w-full rounded-md border border-slate-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <p className="text-sm text-slate-500 p-6">Loading...</p>
        ) : customers.length === 0 ? (
          <div className="py-16 flex flex-col items-center gap-3">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
              <Users className="w-5 h-5 text-slate-400" />
            </div>
            <p className="text-sm text-slate-500">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[720px]">
              <thead>
                <tr className="text-left text-slate-500 border-b border-slate-200 bg-slate-50">
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Total Spent</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((cust) => (
                  <tr key={cust._id} className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{cust.name}</p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[180px]">{formatAddress(cust.address)}</span>
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {cust.email || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        {cust.phone || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-900 whitespace-nowrap">
                      {formatCurrency(cust.totalSpent || 0)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${
                        cust.isActive
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-red-100 text-red-700"
                      }`}>
                        {cust.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/dashboard/customers/${cust._id}`}
                          className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600 transition"
                          title="View History"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => openEdit(cust)}
                          className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(cust)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-red-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {formOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">
                {editingId ? "Edit Customer" : "Add New Customer"}
              </h3>
              <button
                onClick={() => setFormOpen(false)}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">

              {/* Type */}
              <div className="flex gap-3">
                {["individual", "business"].map((t) => (
                  <label key={t} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 capitalize">
                    <input
                      type="radio" name="type" value={t}
                      checked={formData.type === t}
                      onChange={handleChange}
                      className="accent-slate-900"
                    />
                    {t}
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                <input
                  name="name" required value={formData.name} onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className={`w-full text-sm px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                    formErrors.name ? "border-red-400" : "border-slate-300"
                  }`}
                />
                {formErrors.name && <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>}
              </div>

              {/* Company (business only) */}
              {formData.type === "business" && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                  <input
                    name="companyName" value={formData.companyName} onChange={handleChange}
                    placeholder="e.g. Acme Corp"
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                  <input
                    name="email" type="email" value={formData.email} onChange={handleChange}
                    placeholder="john@example.com"
                    className={`w-full text-sm px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                      formErrors.email ? "border-red-400" : "border-slate-300"
                    }`}
                  />
                  {formErrors.email && <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    name="phone" value={formData.phone} onChange={handleChange}
                    placeholder="+92 300 1234567"
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Address</label>
                <div className="space-y-2">
                  <input
                    name="street" value={formData.address.street} onChange={handleAddressChange}
                    placeholder="Street address"
                    className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      name="city" value={formData.address.city} onChange={handleAddressChange}
                      placeholder="City"
                      className="text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    <input
                      name="state" value={formData.address.state} onChange={handleAddressChange}
                      placeholder="State / Province"
                      className="text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      name="country" value={formData.address.country} onChange={handleAddressChange}
                      placeholder="Country"
                      className="text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                    <input
                      name="postalCode" value={formData.address.postalCode} onChange={handleAddressChange}
                      placeholder="Postal code"
                      className="text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Credit Limit</label>
                <input
                  name="creditLimit" type="number" min="0"
                  value={formData.creditLimit} onChange={handleChange}
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Note</label>
                <textarea
                  name="note" rows={2} value={formData.note} onChange={handleChange}
                  placeholder="Optional notes about this customer"
                  className="w-full text-sm px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
                <button
                  type="submit" disabled={saveMutation.isPending}
                  className="bg-slate-900 text-white text-sm font-medium rounded-md px-4 py-2 hover:bg-slate-800 disabled:opacity-60"
                >
                  {saveMutation.isPending ? "Saving..." : "Save Customer"}
                </button>
                <button
                  type="button" onClick={() => setFormOpen(false)}
                  className="text-sm font-medium text-slate-600 px-4 py-2 hover:bg-slate-100 rounded-md"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="text-base font-semibold text-slate-900">Delete Customer</h3>
            <p className="text-sm text-slate-600 mt-2">
              Are you sure you want to delete{" "}
              <span className="font-medium">{deleteTarget.name}</span>?
              {(deleteTarget.totalPurchases > 0) && (
                <span className="text-amber-600 block mt-1 text-xs">
                  ⚠ This customer has {deleteTarget.totalPurchases} purchase(s). Sales records will remain.
                </span>
              )}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 mt-5">
              <button
                onClick={() => deleteMutation.mutate(deleteTarget._id)}
                disabled={deleteMutation.isPending}
                className="flex-1 bg-red-600 text-white text-sm font-medium rounded-md py-2 hover:bg-red-700 disabled:opacity-60"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
              <button
                onClick={() => setDeleteTarget(null)}
                className="flex-1 border border-slate-300 text-slate-700 text-sm font-medium rounded-md py-2 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}