"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProducts } from "../../../../src/hooks/useProducts";
import { useCustomers } from "../../../../src/hooks/useCustomers";
import { useCreateSale } from "../../../../src/hooks/useSales";
import { Search, ShoppingCart, Trash2, Plus, Minus, ChevronLeft, User, Scan } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "../../../../src/utils/formatCurrency";
import { toast } from "../../../../src/components/layout/Toast";
import SkeletonLoader from "../../../../src/components/layout/SkeletonLoader";

export default function NewSalePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [cart, setCart] = useState([]);
  const [discount, setDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState("Cash");

  const { data: prodData, isLoading: prodsLoading } = useProducts({ search: searchQuery });
  const { data: custData, isLoading: custsLoading } = useCustomers();
  const createSaleMutation = useCreateSale();

  const products = prodData?.products || [];
  const customers = custData?.customers || [];

  const addToCart = (product) => {
    if (product.quantity <= 0) {
      toast.error(`${product.name} is currently out of stock`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product._id);
      if (existing) {
        if (existing.quantity >= product.quantity) {
          toast.error(`Only ${product.quantity} units of ${product.name} are available in stock`);
          return prev;
        }
        return prev.map((item) =>
          item.productId === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          cost: product.cost,
          stock: product.quantity,
          quantity: 1,
        },
      ];
    });
  };

  const updateQuantity = (productId, amount) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + amount;
            if (newQty > item.stock) {
              toast.error(`Cannot exceed current stock level of ${item.stock} units`);
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const getSubtotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  };

  const getTax = () => {
    const taxable = Math.max(0, getSubtotal() - discount);
    return parseFloat((taxable * 0.08).toFixed(2));
  };

  const getTotal = () => {
    return Math.max(0, getSubtotal() - discount) + getTax();
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Please add items to your cart before checking out");
      return;
    }

  const payload = {
  customer: selectedCustomerId || undefined,
  items: cart.map((item) => ({
    product: item.productId,      
    quantity: item.quantity,
    unitPrice: item.price,
  })),
  discount: parseFloat(discount) || 0,
  paymentMethod,
};

    createSaleMutation.mutate(payload, {
      onSuccess: () => {
        toast.success("Order processed successfully");
        router.push("/dashboard/sales");
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Failed to create sales order");
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/sales"
          className="p-2 rounded-lg border border-slate-250 hover:bg-slate-100 text-slate-650 transition"
        >
          <ChevronLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Sales Register</h1>
          <p className="text-sm text-slate-500">Checkout products and issue transaction invoices</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Product Selection (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search products by sku, model, name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-4 py-2 w-full text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>
            <Link
              href="/dashboard/scanner"
              className="flex items-center gap-1.5 border border-slate-300 hover:bg-slate-50 px-3 py-2 rounded-lg text-slate-700 text-xs font-semibold"
              title="Scanner module"
            >
              <Scan className="w-4 h-4" />
              Scan Barcode
            </Link>
          </div>

          <div className="min-h-[400px]">
            {prodsLoading ? (
              <SkeletonLoader variant="table" cols={4} rows={6} />
            ) : products.length === 0 ? (
              <p className="text-slate-500 text-sm py-12 text-center">No products match your search query.</p>
            ) : (
              <div className="overflow-x-auto border border-slate-150 rounded-lg">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 border-b border-slate-150 text-[10px] text-slate-500 uppercase font-semibold">
                    <tr>
                      <th className="px-4 py-2.5">Product</th>
                      <th className="px-4 py-2.5">Price</th>
                      <th className="px-4 py-2.5">Stock</th>
                      <th className="px-4 py-2.5 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((prod) => {
                      const isLowStock = prod.quantity <= prod.minStock;
                      const isOutOfStock = prod.quantity === 0;

                      return (
                        <tr key={prod._id} className="hover:bg-slate-50 transition">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-slate-800">{prod.name}</p>
                            <p className="text-xs text-slate-400">{prod.sku}</p>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {formatCurrency(prod.price)}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                isOutOfStock
                                  ? "bg-red-50 text-red-750 border border-red-100"
                                  : isLowStock
                                  ? "bg-amber-50 text-amber-750 border border-amber-100"
                                  : "bg-emerald-50 text-emerald-750 border border-emerald-100"
                              }`}
                            >
                              {isOutOfStock ? "Out of Stock" : `${prod.quantity} Left`}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              disabled={isOutOfStock}
                              onClick={() => addToCart(prod)}
                              className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg px-3 py-1.5 disabled:opacity-30 disabled:hover:bg-slate-900 transition shadow-sm"
                            >
                              Add to Order
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Cart Summary (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <ShoppingCart className="w-5 h-5 text-slate-800" />
            <h3 className="font-bold text-slate-850 text-sm">Customer Cart</h3>
            <span className="ml-auto bg-slate-900 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} items
            </span>
          </div>

          {/* Customer Selection */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">Select Customer Profile</label>
            {custsLoading ? (
              <div className="h-9 bg-slate-100 rounded animate-pulse" />
            ) : (
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full text-sm border border-slate-300 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="">Walk-in Customer (Guest)</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.email || c.phone || "No contact"})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Cart Items List */}
          <div className="min-h-[180px] max-h-[300px] overflow-y-auto border border-slate-100 rounded-lg p-2.5 space-y-2">
            {cart.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                <ShoppingCart className="w-6 h-6 mx-auto mb-2 text-slate-300" />
                Cart is empty
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between border-b border-slate-50 pb-2 mb-2 last:border-0 last:mb-0 last:pb-0"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-800 text-xs truncate">{item.name}</p>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {formatCurrency(item.price)} each
                    </p>
                  </div>

                  <div className="flex items-center gap-3.5 ml-4 shrink-0">
                    <div className="flex items-center border border-slate-300 rounded-md">
                      <button
                        onClick={() => updateQuantity(item.productId, -1)}
                        className="p-1 hover:bg-slate-100 text-slate-655"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center font-bold text-xs text-slate-800">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, 1)}
                        className="p-1 hover:bg-slate-100 text-slate-655"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-bold text-xs text-slate-900 w-16 text-right">
                      {formatCurrency(item.price * item.quantity)}
                    </span>

                    <button
                      onClick={() => removeFromCart(item.productId)}
                      className="p-1 text-red-500 hover:text-red-750 hover:bg-red-50 rounded-md"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pricing aggregates */}
          <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
            <div className="flex justify-between font-medium text-slate-600">
              <span>Subtotal:</span>
              <span className="font-semibold">{formatCurrency(getSubtotal())}</span>
            </div>

            <div className="flex justify-between items-center font-medium text-slate-650">
              <span>Applied Discount ($):</span>
              <input
                type="number"
                min="0"
                value={discount || ""}
                onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-20 text-right border border-slate-300 rounded px-1.5 py-0.5 text-xs font-semibold"
              />
            </div>

            <div className="flex justify-between font-medium text-slate-600">
              <span>Tax (8%):</span>
              <span className="font-semibold">{formatCurrency(getTax())}</span>
            </div>

            <div className="flex justify-between font-bold text-slate-900 text-sm border-t border-dashed border-slate-200 pt-2">
              <span>Total Payment:</span>
              <span>{formatCurrency(getTotal())}</span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-1.5 border-t border-slate-100 pt-3">
            <label className="block text-xs font-semibold text-slate-700">Payment Option</label>
            <div className="grid grid-cols-3 gap-2">
              {["Cash", "Card", "Transfer"].map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 text-xs font-bold rounded-lg border transition ${
                    paymentMethod === method
                      ? "bg-slate-950 border-slate-950 text-white"
                      : "border-slate-300 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Checkout CTA */}
          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || createSaleMutation.isPending}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 hover:disabled:bg-emerald-600 text-white font-bold text-sm py-3 rounded-lg shadow-sm transition flex items-center justify-center gap-2"
          >
            {createSaleMutation.isPending ? "Processing..." : "Complete Order"}
          </button>
        </div>
      </div>
    </div>
  );
}
