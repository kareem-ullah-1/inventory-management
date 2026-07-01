"use client";

import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "../../utils/formatCurrency";

export default function ProductTable({ products = [], onDelete, isLoading }) {
  if (isLoading) {
    return <p className="text-sm text-slate-500 py-6 text-center">Loading products...</p>;
  }

  if (!products.length) {
    return (
      <p className="text-sm text-slate-500 py-6 text-center">
        No products found
      </p>
    );
  }

  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="text-left text-slate-500 border-b border-slate-200">
          <th className="py-2 font-medium">Name</th>
          <th className="py-2 font-medium">SKU</th>
          <th className="py-2 font-medium">Category</th>
          <th className="py-2 font-medium">Price</th>
          <th className="py-2 font-medium">Quantity</th>
          <th className="py-2 font-medium">Status</th>
          <th className="py-2 font-medium text-right">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {products.map((product) => (
          <tr key={product._id}>
            <td className="py-2 text-slate-900 font-medium">
              {product.name}
            </td>
            <td className="py-2 text-slate-600">{product.sku}</td>
            <td className="py-2 text-slate-600">{product.category}</td>
            <td className="py-2 text-slate-600">
              {formatCurrency(product.price)}
            </td>
            <td className="py-2 text-slate-600">{product.quantity}</td>
            <td className="py-2">
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  product.isLowStock
                    ? "bg-amber-100 text-amber-700"
                    : "bg-emerald-100 text-emerald-700"
                }`}
              >
                {product.isLowStock ? "Low Stock" : "In Stock"}
              </span>
            </td>
            <td className="py-2">
              <div className="flex items-center justify-end gap-2">
                <Link
                  href={`/dashboard/products/${product._id}`}
                  className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600"
                >
                  <Pencil className="w-4 h-4" />
                </Link>
                <button
                  onClick={() => onDelete?.(product._id)}
                  className="p-1.5 rounded-md hover:bg-red-50 text-red-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
