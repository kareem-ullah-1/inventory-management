"use client";

import { useCustomerDetails } from "../../../../src/hooks/useCustomers";
import { ChevronLeft, Mail, Phone, MapPin, Calendar, ShoppingBag, Receipt, Eye } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "../../../../src/utils/formatCurrency";
import { formatDate } from "../../../../src/utils/formatDate";
import SkeletonLoader from "../../../../src/components/layout/SkeletonLoader";

const formatAddress = (address) => {
  if (!address) return "No address listed";
  if (typeof address === "string") return address || "No address listed";
  const { street, city, state, country, postalCode } = address;
  return [street, city, state, country, postalCode].filter(Boolean).join(", ") || "No address listed";
};

export default function CustomerDetailsPage({ params }) {
  const { id } = params;
  const { data, isLoading, error } = useCustomerDetails(id);

  const customer = data?.customer;
  const history = data?.history || [];

  if (isLoading) {
    return <SkeletonLoader variant="detail" />;
  }

  if (error || !customer) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
        <h3 className="text-lg font-semibold text-slate-800">Customer Profile Not Found</h3>
        <p className="text-sm text-slate-500">The customer profile you are trying to view does not exist or has been deleted.</p>
        <Link
          href="/dashboard/customers"
          className="inline-flex items-center gap-1.5 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-slate-800"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/customers"
          className="p-2 rounded-lg border border-slate-250 hover:bg-slate-100 text-slate-600 transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">{customer.name}</h1>
          <p className="text-xs text-slate-500">Customer account reference: {customer._id}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Contact info card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm self-start">
          <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Profile Overview</h3>
          <div className="space-y-3.5 text-sm">
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase leading-none">Email Address</p>
                <p className="text-slate-800 font-medium mt-1">{customer.email || "No email listed"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase leading-none">Phone Number</p>
                <p className="text-slate-800 font-medium mt-1">{customer.phone || "No phone listed"}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase leading-none">Address</p>
                <p className="text-slate-800 font-medium mt-1">{formatAddress(customer.address)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 border-t border-slate-100 pt-3.5">
              <Calendar className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <p className="text-[10px] text-slate-500 font-semibold uppercase leading-none">Registered On</p>
                <p className="text-slate-800 font-medium mt-1">{formatDate(customer.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats and purchase history */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Lifetime Purchases</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{history.length} Orders</p>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center gap-4 shadow-sm">
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">Total Expenditure</p>
                <p className="text-xl font-bold text-slate-900 mt-0.5">{formatCurrency(customer.totalSpent || 0)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Purchase History Timeline</h3>
            {history.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">This customer has not placed any orders yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase tracking-wider font-semibold">
                    <tr>
                      <th className="px-4 py-2.5">Invoice #</th>
                      <th className="px-4 py-2.5">Date</th>
                      <th className="px-4 py-2.5">Items</th>
                      <th className="px-4 py-2.5">Total</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.map((sale) => (
                      <tr key={sale._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-900">{sale.invoiceNumber}</td>
                        <td className="px-4 py-3 text-slate-600">{formatDate(sale.createdAt)}</td>
                        <td className="px-4 py-3 text-slate-600">
                          {sale.items?.reduce((sum, item) => sum + item.quantity, 0)} units
                        </td>
                        <td className="px-4 py-3 text-slate-900 font-semibold">
                          {formatCurrency(sale.total || sale.totalAmount || 0)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/dashboard/sales/${sale._id}`}
                            className="inline-flex items-center gap-1 text-slate-600 hover:text-slate-900 text-xs font-semibold px-2.5 py-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View Order
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}