"use client";

import { useState } from "react";
import { useSales, useUpdateSaleStatus } from "../../../src/hooks/useSales";
import {
  Plus,
  Search,
  Receipt,
  Calendar,
  Eye,
  FileText,
} from "lucide-react";
import Link from "next/link";
import SkeletonLoader from "../../../src/components/layout/SkeletonLoader";
import { formatCurrency } from "../../../src/utils/formatCurrency";
import { formatDate } from "../../../src/utils/formatDate";

const statusStyles = {
  completed: "text-emerald-700 bg-emerald-50 border-emerald-200",
  pending: "text-yellow-700 bg-yellow-50 border-yellow-200",
  cancelled: "text-red-700 bg-red-50 border-red-200",
  refunded: "text-slate-700 bg-slate-100 border-slate-200",
};

export default function SalesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading } = useSales({
    search: searchTerm,
    status: statusFilter,
  });

  const updateStatus = useUpdateSaleStatus();

  const sales = data?.sales || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Sales Transactions
          </h1>
          <p className="text-sm text-slate-500">
            View invoices, track receipts, and register customer orders
          </p>
        </div>

        <Link
          href="/dashboard/sales/new"
          className="flex items-center justify-center gap-2 bg-slate-900 text-white text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-slate-800 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create New Sale
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice # or customer name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
          />
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs font-semibold text-slate-550">
            Filter Status:
          </span>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-slate-300 text-sm px-3.5 py-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="">All Invoices</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Sales Table */}
      {isLoading ? (
        <div className="bg-white p-6 border border-slate-200 rounded-xl">
          <SkeletonLoader variant="table" cols={5} />
        </div>
      ) : sales.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl py-12 text-center">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <Receipt className="w-6 h-6 text-slate-400" />
          </div>

          <h3 className="text-sm font-semibold text-slate-800">
            No Sales Recorded
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            Submit your first customer transaction to start tracking income.
          </p>

          <Link
            href="/dashboard/sales/new"
            className="mt-4 inline-flex items-center gap-1.5 bg-slate-900 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-slate-800"
          >
            <Plus className="w-3.5 h-3.5" />
            Create Sale
          </Link>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Invoice #</th>
                  <th className="px-6 py-3.5">Customer Name</th>
                  <th className="px-6 py-3.5">Date</th>
                  <th className="px-6 py-3.5">Total Amount</th>
                  <th className="px-6 py-3.5">Payment</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {sales.map((sale) => (
                  <tr
                    key={sale._id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-slate-900">
                      {sale.invoiceNumber}
                    </td>

                    <td className="px-6 py-4 text-slate-800 font-medium">
                      {sale.customer?.name || "Walk-in Customer"}
                    </td>

                    <td className="px-6 py-4 text-slate-500 text-xs">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {formatDate(sale.createdAt)}
                      </div>
                    </td>

                    <td className="px-6 py-4 text-slate-900 font-bold">
                      {formatCurrency(sale.total)}
                    </td>

                    <td className="px-6 py-4">
                      <span className="text-slate-650 text-xs font-semibold bg-slate-100 px-2 py-0.5 rounded-md">
                        {sale.paymentMethod}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <select
                        value={sale.status}
                        onChange={(e) =>
                          updateStatus.mutate({ id: sale._id, status: e.target.value })
                        }
                        disabled={updateStatus.isPending}
                        className={`text-xs font-semibold px-2 py-1 rounded-full border cursor-pointer focus:outline-none focus:ring-2 focus:ring-slate-900 ${
                          statusStyles[sale.status] || statusStyles.pending
                        }`}
                      >
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="refunded">Refunded</option>
                      </select>
                    </td>

                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/sales/${sale._id}`}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center gap-1 text-xs font-semibold"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </Link>

                        <Link
                          href={`/dashboard/sales/${sale._id}/invoice`}
                          className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 flex items-center gap-1 text-xs font-semibold"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          Invoice
                        </Link>
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