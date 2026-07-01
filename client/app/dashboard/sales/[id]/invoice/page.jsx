"use client";

import { useSaleDetails } from "../../../../../src/hooks/useSales";
import { ChevronLeft, Printer, Download, CreditCard, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "../../../../../src/utils/formatCurrency";
import { formatDate } from "../../../../../src/utils/formatDate";
import SkeletonLoader from "../../../../../src/components/layout/SkeletonLoader";

export default function InvoicePage({ params }) {
  const { id } = params;
  const { data, isLoading, error } = useSaleDetails(id);

  const sale = data?.sale;

  const handlePrint = () => {
    if (typeof window !== "undefined") {
      window.print();
    }
  };

  if (isLoading) {
    return <SkeletonLoader variant="detail" />;
  }

  if (error || !sale) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center space-y-3">
        <h3 className="text-lg font-semibold text-slate-800">Invoice Not Found</h3>
        <p className="text-sm text-slate-500">The invoice record you are looking for does not exist.</p>
        <Link
          href="/dashboard/sales"
          className="inline-flex items-center gap-1.5 bg-slate-900 text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-slate-800"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Sales
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Print Overrides Stylesheet */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          aside, header, nav, .no-print, button {
            display: none !important;
          }
          main {
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }
          body, html {
            background: white !important;
            color: black !important;
          }
          .invoice-card {
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
          }
        }
      `}} />

      {/* Navigation header (no-print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/sales/${sale._id}`}
            className="p-2 rounded-lg border border-slate-250 hover:bg-slate-100 text-slate-655 transition"
          >
            <ChevronLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Invoice Preview</h1>
            <p className="text-xs text-slate-500">Preview document and trigger printing / export actions</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg px-4 py-2.5 shadow-sm transition"
          >
            <Printer className="w-4 h-4" />
            Print Invoice
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center justify-center gap-1.5 border border-slate-350 bg-white hover:bg-slate-55 text-slate-700 text-xs font-semibold rounded-lg px-4 py-2.5 shadow-sm transition"
            title="Saves invoice as PDF using the browser native Save to PDF option"
          >
            <Download className="w-4 h-4" />
            Save as PDF
          </button>
        </div>
      </div>

      {/* Printable Invoice Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-8 max-w-4xl mx-auto shadow-sm invoice-card space-y-8">
        {/* Invoice Top header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-slate-100 pb-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center">
              <span className="font-extrabold text-white text-base">SF</span>
            </div>
            <div>
              <p className="font-bold text-lg text-slate-900 leading-none">StockFlow Inc.</p>
              <p className="text-[10px] text-slate-500 mt-1">Warehouse Enterprise Resource Planner</p>
            </div>
          </div>

          <div className="sm:text-right">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">INVOICE</h2>
            <p className="text-sm font-bold text-slate-705 mt-1">{sale.invoiceNumber}</p>
          </div>
        </div>

        {/* Invoice Metadata (Bill to / Dates) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 text-sm">
          {/* Bill To */}
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Billed To</h4>
            {sale.customer?._id ? (
              <div className="space-y-1 text-slate-750">
                <p className="font-bold text-slate-900">{sale.customer.name}</p>
                <p className="text-xs">{sale.customer.email}</p>
                <p className="text-xs">{sale.customer.phone}</p>
                <p className="text-xs whitespace-pre-line mt-1">{sale.customer.address}</p>
              </div>
            ) : (
              <div className="text-slate-600 font-semibold">
                <p>Walk-in Customer</p>
                <p className="text-xs text-slate-400 mt-0.5">Guest Checkout</p>
              </div>
            )}
          </div>

          {/* Supplier / Address Details */}
          <div>
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Issued By</h4>
            <div className="space-y-1 text-slate-700 text-xs">
              <p className="font-bold text-slate-900">StockFlow Distribution</p>
              <p>444 Logistics Drive, Suite A</p>
              <p>Chicago, IL 60601</p>
              <p>billing@stockflow.com</p>
            </div>
          </div>

          {/* Dates & Reference */}
          <div className="sm:text-right md:text-right">
            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">References</h4>
            <div className="space-y-1.5 text-xs text-slate-600 font-semibold">
              <p>
                <span className="text-slate-400 font-normal">Date Issued:</span>{" "}
                {formatDate(sale.createdAt)}
              </p>
              <p>
                <span className="text-slate-400 font-normal">Payment mode:</span>{" "}
                {sale.paymentMethod}
              </p>
              <p>
                <span className="text-slate-400 font-normal">Cashier:</span>{" "}
                {sale.soldBy?.name || "System"}
              </p>
            </div>
          </div>
        </div>

        {/* Invoice Item Table */}
        <div className="border border-slate-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[10px] uppercase font-bold tracking-wider">
              <tr>
                <th className="px-4 py-3">Product Name</th>
                <th className="px-4 py-3">Unit Price</th>
                <th className="px-4 py-3 text-center">Quantity</th>
                <th className="px-4 py-3 text-right">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-slate-800">
              {sale.items.map((item, index) => (
                <tr key={index}>
                  <td className="px-4 py-3 font-medium">
                    <p>{item.name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{item.sku}</p>
                  </td>
                  <td className="px-4 py-3">{formatCurrency(item.unitPrice)}</td>
                  <td className="px-4 py-3 text-center font-bold">{item.quantity}</td>
                  <td className="px-4 py-3 text-right font-semibold">
                    {formatCurrency(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Subtotals & Signatures */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pt-4">
          {/* Payment Terms Info */}
          <div className="space-y-2 max-w-sm text-xs font-semibold text-slate-500">
            <div className="flex items-center gap-1.5 text-slate-800">
              <CreditCard className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-bold text-slate-900">Payment Terms</span>
            </div>
            <p className="leading-relaxed">
              Invoice paid in full at time of checkout. Thank you for choosing StockFlow Distributors for your warehouse purchases.
            </p>
          </div>

          {/* Pricing calculations */}
          <div className="w-full md:w-80 space-y-2.5 text-xs border-t border-slate-100 pt-4 md:border-t-0 md:pt-0">
            <div className="flex justify-between font-semibold text-slate-500">
              <span>Subtotal:</span>
              <span className="text-slate-850 font-bold">{formatCurrency(sale.subtotal)}</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-500">
              <span>Discount applied:</span>
              <span className="text-red-650 font-bold">-{formatCurrency(sale.discount || 0)}</span>
            </div>
            <div className="flex justify-between font-semibold text-slate-500 border-b border-slate-100 pb-2">
              <span>Sales Tax (8%):</span>
              <span className="text-slate-850 font-bold">{formatCurrency(sale.taxAmount || 0)}</span>
            </div>
            <div className="flex justify-between text-base font-black text-slate-950 pt-1.5">
              <span>Total Payment:</span>
              <span>{formatCurrency(sale.total)}</span>
            </div>
          </div>
        </div>

        {/* Invoice Footer note */}
        <div className="border-t border-slate-100 pt-6 text-center text-xs text-slate-450 font-medium">
          <div className="flex items-center justify-center gap-1 text-slate-500 font-bold mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Secured StockFlow Transaction Receipt</span>
          </div>
          <p>For return policies, please contact billing@stockflow.com. Thank you for your business!</p>
        </div>
      </div>
    </div>
  );
}
