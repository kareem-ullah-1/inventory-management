"use client";

import { useSaleDetails } from "../../../../src/hooks/useSales";
import {
  ChevronLeft,
  Calendar,
  User,
  Printer,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "../../../../src/utils/formatCurrency";
import { formatDate } from "../../../../src/utils/formatDate";
import SkeletonLoader from "../../../../src/components/layout/SkeletonLoader";

const statusStyles = {
  completed: { icon: CheckCircle2, className: "text-emerald-700 bg-emerald-50 border-emerald-100" },
  pending: { icon: Clock, className: "text-amber-700 bg-amber-50 border-amber-100" },
  cancelled: { icon: XCircle, className: "text-red-700 bg-red-50 border-red-100" },
  refunded: { icon: RotateCcw, className: "text-slate-700 bg-slate-100 border-slate-200" },
};

const paymentStatusStyles = {
  paid: { icon: CheckCircle2, className: "text-emerald-700 bg-emerald-50 border-emerald-100" },
  pending: { icon: Clock, className: "text-amber-700 bg-amber-50 border-amber-100" },
  partial: { icon: Clock, className: "text-blue-700 bg-blue-50 border-blue-100" },
  cancelled: { icon: XCircle, className: "text-red-700 bg-red-50 border-red-100" },
};

function StatusBadge({ value, config }) {
  const key = (value || "").toLowerCase();
  const { icon: Icon, className } = config[key] || config[Object.keys(config)[0]];
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[10px] border capitalize ${className}`}
    >
      <Icon className="w-3 h-3" />
      {value}
    </span>
  );
}

export default function SaleDetailsPage({ params }) {
  const { id } = params;
  const { data, isLoading, error } = useSaleDetails(id);

  const sale = data?.sale;

  if (isLoading) {
    return <SkeletonLoader variant="detail" />;
  }

  if (error || !sale) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
        <h3 className="text-lg font-semibold text-slate-800">Order Details Not Found</h3>
        <p className="text-sm text-slate-500">The sales transaction record you requested cannot be fetched.</p>
        <Link
          href="/dashboard/sales"
          className="inline-flex items-center gap-1.5 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-slate-800"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Sales List
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/sales"
            className="p-2 rounded-lg border border-slate-250 hover:bg-slate-100 text-slate-600 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Sale Details: {sale.invoiceNumber}</h1>
            <p className="text-xs text-slate-500">Transaction ID reference: {sale._id}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/sales/${sale._id}/invoice`}
            className="flex items-center justify-center gap-1.5 border border-slate-350 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg px-4 py-2.5 shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </Link>
          <Link
            href={`/dashboard/sales/${sale._id}/invoice`}
            className="flex items-center justify-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg px-4 py-2.5 shadow-sm transition"
          >
            <FileText className="w-4 h-4" />
            View Invoice
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left main card (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Items breakdown list */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-850 text-sm">Itemized Order Summary</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-550 text-[10px] uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">Item Name / SKU</th>
                    <th className="px-4 py-2.5">Unit Price</th>
                    <th className="px-4 py-2.5 text-center">Qty Ordered</th>
                    <th className="px-4 py-2.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sale.items.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3.5">
                        <div className="font-semibold text-slate-800">{item.name}</div>
                        <div className="text-[10px] text-slate-450 mt-0.5">{item.sku}</div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700">{formatCurrency(item.unitPrice)}</td>
                      <td className="px-4 py-3.5 text-center font-bold text-slate-850">{item.quantity}</td>
                      <td className="px-4 py-3.5 text-right font-bold text-slate-900">
                        {formatCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transaction aggregates */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-3 max-w-sm ml-auto">
            <div className="flex justify-between text-xs font-semibold text-slate-550">
              <span>Subtotal:</span>
              <span className="text-slate-850">{formatCurrency(sale.subtotal)}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-slate-550">
              <span>Discount Applied:</span>
              <span className="text-red-650">-{formatCurrency(sale.discount || 0)}</span>
            </div>
            <div className="flex justify-between text-xs font-semibold text-slate-550 border-b border-slate-100 pb-2">
              <span>Sales Tax ({sale.taxRate || 0}%):</span>
              <span className="text-slate-850">{formatCurrency(sale.taxAmount || 0)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-slate-950 pt-1">
              <span>Total Revenue:</span>
              <span>{formatCurrency(sale.total)}</span>
            </div>
          </div>
        </div>

        {/* Right card (1 col) */}
        <div className="space-y-6">
          {/* Metadata & Status Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-850 text-sm border-b border-slate-100 pb-2">Receipt Info</h3>

            <div className="space-y-3.5 text-xs font-semibold text-slate-500">
              <div className="flex justify-between">
                <span>Payment Mode:</span>
                <span className="text-slate-905 bg-slate-100 px-2 py-0.5 rounded-md font-bold text-[10px] capitalize">
                  {sale.paymentMethod?.replace("_", " ")}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span>Payment Status:</span>
                <StatusBadge value={sale.paymentStatus} config={paymentStatusStyles} />
              </div>

              <div className="flex justify-between items-center">
                <span>Sale Status:</span>
                <StatusBadge value={sale.status} config={statusStyles} />
              </div>

              <div className="flex justify-between">
                <span>Processed Date:</span>
                <span className="text-slate-800 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatDate(sale.createdAt)}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Cashier Reference:</span>
                <span className="text-slate-800 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {sale.soldBy?.name || "System"}
                </span>
              </div>
            </div>
          </div>

          {/* Customer profile link */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-850 text-sm border-b border-slate-100 pb-2">Customer Account</h3>
            {sale.customer?._id ? (
              <div className="space-y-3">
                <div>
                  <p className="text-[10px] text-slate-450 uppercase font-bold">Billing Account Name</p>
                  <p className="text-sm text-slate-900 font-bold mt-0.5">{sale.customer.name}</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-450 uppercase font-bold">Contact Email</p>
                  <p className="text-xs text-slate-700 mt-0.5">{sale.customer.email || "No email registered"}</p>
                </div>
                <Link
                  href={`/dashboard/customers/${sale.customer._id}`}
                  className="block text-center text-xs font-bold text-slate-800 border border-slate-300 hover:bg-slate-50 py-2 rounded-lg transition"
                >
                  View Customer Purchases
                </Link>
              </div>
            ) : (
              <div className="text-slate-550 text-xs py-2">
                <p className="font-bold text-slate-800">Walk-in Customer</p>
                <p className="mt-1 text-[11px]">No customer profile was assigned to this order invoice.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}