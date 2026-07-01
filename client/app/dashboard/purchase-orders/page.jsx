"use client";

import { useState } from "react";
import {
  usePurchaseOrders,
  useCreatePurchaseOrder,
  useUpdatePurchaseOrderStatus,
} from "../../../src/hooks/usePurchaseOrders";
import { useSuppliers } from "../../../src/hooks/useSuppliers";
import { useProducts } from "../../../src/hooks/useProducts";
import { Plus, ShoppingCart, Calendar, CheckCircle2, AlertCircle, ArrowUpRight } from "lucide-react";
import SkeletonLoader from "../../../src/components/layout/SkeletonLoader";
import { formatCurrency } from "../../../src/utils/formatCurrency";
import { formatDate } from "../../../src/utils/formatDate";
import { toast } from "../../../src/components/layout/Toast";

const initialPOItem = { productId: "", quantity: 1, cost: 0 };

export default function PurchaseOrdersPage() {
  const [formOpen, setFormOpen] = useState(false);
  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState([initialPOItem]);

  const { data: poData, isLoading: poLoading } = usePurchaseOrders();
  const { data: supData, isLoading: supLoading } = useSuppliers();
  const { data: prodData } = useProducts();

  const createPOMutation = useCreatePurchaseOrder();
  const updateStatusMutation = useUpdatePurchaseOrderStatus();

  const purchaseOrders = poData?.purchaseOrders || [];
  const suppliers = supData?.suppliers || [];
  const products = prodData?.products || [];

  const handleAddItem = () => {
    setItems([...items, { productId: "", quantity: 1, cost: 0 }]);
  };

  const handleRemoveItem = (index) => {
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    if (field === "productId") {
      newItems[index].productId = value;
      const prod = products.find((p) => p._id === value);
      if (prod) newItems[index].cost = prod.costPrice || prod.cost || 0;
    } else if (field === "quantity") {
      newItems[index].quantity = Math.max(1, parseInt(value) || 1);
    } else if (field === "cost") {
      newItems[index].cost = Math.max(0, parseFloat(value) || 0);
    }
    setItems(newItems);
  };

  const handleOpenForm = () => {
    setSupplierId("");
    setItems([{ productId: "", quantity: 1, cost: 0 }]);
    setFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!supplierId) {
      toast.error("Please select a supplier");
      return;
    }
    if (items.some((item) => !item.productId)) {
      toast.error("Please pick a product for all order rows");
      return;
    }

    const payload = {
      supplierId,
      items: items.map((it) => ({
        productId: it.productId,
        quantity: it.quantity,
        cost: it.cost,
      })),
    };

    createPOMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Purchase order submitted successfully");
        setFormOpen(false);
      },
      onError: () => {
        toast.error("Failed to create purchase order");
      },
    });
  };

  const handleMarkReceived = (poId, orderNum) => {
    if (
      confirm(
        `Confirm receipt of restocking order ${orderNum}? This will increase inventory stock counts.`
      )
    ) {
      updateStatusMutation.mutate(
        { id: poId },
        {
          onSuccess: () => {
            toast.success(`Restocked products matching ${orderNum}`);
          },
          onError: () => {
            toast.error("Failed to update status");
          },
        }
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Purchase Orders (Procurement)</h1>
          <p className="text-sm text-slate-500">Order inventory from suppliers and track restock statuses</p>
        </div>
        <button
          onClick={handleOpenForm}
          className="flex items-center justify-center gap-2 bg-slate-950 text-white text-sm font-semibold rounded-lg px-4 py-2.5 hover:bg-slate-800 transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Purchase Order
        </button>
      </div>

      {poLoading ? (
        <div className="bg-white p-6 border border-slate-200 rounded-xl">
          <SkeletonLoader variant="table" cols={5} />
        </div>
      ) : purchaseOrders.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl py-12 text-center">
          <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
            <ShoppingCart className="w-6 h-6 text-slate-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">No Purchase Orders</h3>
          <p className="text-xs text-slate-500 mt-1">Submit your first restocking request to a supplier.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 text-[11px] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Order Number</th>
                  <th className="px-6 py-3.5">Supplier</th>
                  <th className="px-6 py-3.5">Date Issued</th>
                  <th className="px-6 py-3.5">Restocked Items</th>
                  <th className="px-6 py-3.5">Total Cost</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {purchaseOrders.map((po) => {
                  // ← fix: backend saves lowercase "received"
                  const isReceived = po.status === "received";
                  const isCancelled = po.status === "cancelled";
                  const totalItems = po.items.reduce((sum, item) => sum + item.quantity, 0);

                  return (
                    <tr key={po._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4 font-semibold text-slate-900">{po.orderNumber}</td>
                      <td className="px-6 py-4 text-slate-800 font-medium">{po.supplier?.name}</td>
                      <td className="px-6 py-4 text-slate-500 text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {formatDate(po.createdAt)}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-medium">
                        {totalItems} units ({po.items.length} unique)
                      </td>
                      <td className="px-6 py-4 text-slate-900 font-bold">{formatCurrency(po.totalAmount)}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            isReceived
                              ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                              : isCancelled
                              ? "text-red-700 bg-red-50 border-red-100"
                              : "text-amber-700 bg-amber-50 border-amber-100"
                          }`}
                        >
                          {isReceived ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <AlertCircle
                              className={`w-3 h-3 ${isCancelled ? "text-red-600" : "text-amber-600"}`}
                            />
                          )}
                          {po.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!isReceived && !isCancelled ? (
                          <button
                            onClick={() => handleMarkReceived(po._id, po.orderNumber)}
                            disabled={updateStatusMutation.isPending}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition shadow-sm inline-flex items-center gap-1 disabled:opacity-60"
                          >
                            <ArrowUpRight className="w-3 h-3" />
                            Mark Received
                          </button>
                        ) : isReceived ? (
                          <span className="text-xs text-slate-400 font-medium">
                            Received {formatDate(po.receivedAt)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400 font-medium">Cancelled</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white border border-slate-200 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-150 px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5">
                <ShoppingCart className="w-4 h-4 text-slate-600" />
                Draft Supplier Purchase Order
              </h3>
              <button
                onClick={() => setFormOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pick Supplier *</label>
                {supLoading ? (
                  <div className="h-10 bg-slate-100 rounded animate-pulse" />
                ) : (
                  <select
                    required
                    value={supplierId}
                    onChange={(e) => setSupplierId(e.target.value)}
                    className="w-full text-sm border border-slate-300 rounded-lg px-3.5 py-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="">-- Choose Supplier --</option>
                    {suppliers.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Order Items & Restock Quantity</label>
                <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                  {items.map((item, index) => (
                    <div key={index} className="flex gap-3 items-center">
                      <div className="flex-1">
                        <select
                          required
                          value={item.productId}
                          onChange={(e) => handleItemChange(index, "productId", e.target.value)}
                          className="w-full text-xs border border-slate-300 rounded-lg px-2 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
                        >
                          <option value="">-- Select Product --</option>
                          {products.map((p) => (
                            <option key={p._id} value={p._id}>
                              {p.name} ({p.sku})
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="w-20">
                        <input
                          type="number"
                          placeholder="Qty"
                          min="1"
                          required
                          value={item.quantity}
                          onChange={(e) => handleItemChange(index, "quantity", e.target.value)}
                          className="w-full text-xs border border-slate-300 rounded-lg px-2 py-2 text-center focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                      <div className="w-28">
                        <input
                          type="number"
                          placeholder="Cost ($)"
                          step="0.01"
                          min="0"
                          required
                          value={item.cost || ""}
                          onChange={(e) => handleItemChange(index, "cost", e.target.value)}
                          className="w-full text-xs border border-slate-300 rounded-lg px-2 py-2 text-right focus:outline-none focus:ring-2 focus:ring-slate-900"
                        />
                      </div>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="flex items-center gap-1 text-[11px] font-bold text-slate-800 border border-slate-300 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Row
                </button>
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between items-center">
                <span className="text-xs font-semibold text-slate-500">Estimated PO Total:</span>
                <span className="text-base font-bold text-slate-900">
                  {formatCurrency(
                    items.reduce((sum, item) => sum + (item.cost || 0) * (item.quantity || 0), 0)
                  )}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  className="text-xs font-semibold text-slate-600 px-4 py-2 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createPOMutation.isPending}
                  className="bg-slate-900 text-white text-xs font-semibold rounded-lg px-4 py-2 hover:bg-slate-800 disabled:opacity-60"
                >
                  {createPOMutation.isPending ? "Submitting..." : "Submit PO"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}