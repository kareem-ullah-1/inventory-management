"use client";

import { useState } from "react";
import { useProducts } from "../../../src/hooks/useProducts";
import { useCategories } from "../../../src/hooks/useCategories";
import { useSuppliers } from "../../../src/hooks/useSuppliers";
import { Search, SlidersHorizontal, Package, ArrowRight, Eye, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { formatCurrency } from "../../../src/utils/formatCurrency";
import SkeletonLoader from "../../../src/components/layout/SkeletonLoader";

export default function AdvancedSearchPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [supplier, setSupplier] = useState("All");
  const [stockStatus, setStockStatus] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [showFilters, setShowFilters] = useState(true);

  // Fetch results based on search filters
  const { data: prodData, isLoading: prodsLoading } = useProducts({
    search: query,
    category,
    supplier,
    stockStatus,
    minPrice,
    maxPrice,
  });

  const { data: catData } = useCategories();
  const { data: supData } = useSuppliers();

  const products = prodData?.products || [];
  const categories = catData?.categories || [];
  const suppliers = supData?.suppliers || [];

  const handleReset = () => {
    setQuery("");
    setCategory("All");
    setSupplier("All");
    setStockStatus("");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Advanced Product Search</h1>
          <p className="text-sm text-slate-500">Query and filter warehouse holdings with multi-criteria conditions</p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-1.5 border border-slate-300 hover:bg-slate-50 px-3.5 py-2 rounded-lg text-xs font-semibold text-slate-700"
        >
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          {showFilters ? "Hide Filters" : "Show Filters"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Panel: Search Options (4 cols) */}
        {showFilters && (
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-bold text-slate-800 text-sm">Filter Criteria</h3>
              <button
                onClick={handleReset}
                className="text-[11px] font-bold text-red-600 hover:text-red-800 flex items-center gap-0.5"
              >
                <RefreshCcw className="w-3 h-3" />
                Reset All
              </button>
            </div>

            {/* Keyword */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Keyword SKU / Name</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="e.g. keyboard, IPH15P"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 w-full text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="All">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Supplier */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Supplier Source</label>
              <select
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="All">All Suppliers</option>
                {suppliers.map((s) => (
                  <option key={s._id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Stock Level status */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">Stock Availability</label>
              <div className="space-y-1">
                {[
                  { value: "", label: "Any quantity level" },
                  { value: "sufficient", label: "Sufficiently Stocked" },
                  { value: "low", label: "Low Stock Warning" },
                  { value: "out", label: "Out of Stock" },
                ].map((item) => (
                  <label key={item.value} className="flex items-center gap-2 text-xs text-slate-650 cursor-pointer">
                    <input
                      type="radio"
                      name="stockStatus"
                      value={item.value}
                      checked={stockStatus === item.value}
                      onChange={(e) => setStockStatus(e.target.value)}
                      className="text-slate-900 focus:ring-slate-900 border-slate-300"
                    />
                    <span>{item.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Price Ranges */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">Price Range ($)</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 text-center focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
                <span className="text-slate-400 font-medium">—</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full text-xs border border-slate-300 rounded-lg px-2.5 py-1.5 text-center focus:outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>
          </div>
        )}

        {/* Right Panel: Results Listing (8 cols if filters show, 12 if hidden) */}
        <div className={`${showFilters ? "lg:col-span-8" : "lg:col-span-12"} bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4`}>
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-sm">Matching Results</h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              {products.length} Products
            </span>
          </div>

          {prodsLoading ? (
            <SkeletonLoader variant="table" cols={4} rows={6} />
          ) : products.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Package className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              No products found matching these specific filters.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-150 rounded-lg">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 border-b border-slate-150 text-[10px] text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-2.5">Product SKU / Name</th>
                    <th className="px-4 py-2.5">Category</th>
                    <th className="px-4 py-2.5">Unit Price</th>
                    <th className="px-4 py-2.5">Stock Level</th>
                    <th className="px-4 py-2.5 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((prod) => {
                    const isOutOfStock = prod.quantity === 0;
                    const isLowStock = prod.quantity <= prod.minStock && !isOutOfStock;

                    return (
                      <tr key={prod._id} className="hover:bg-slate-50 transition">
                        <td className="px-4 py-3">
                          <p className="font-bold text-slate-800 text-xs">{prod.name}</p>
                          <code className="text-[10px] text-slate-450 mt-0.5">{prod.sku}</code>
                        </td>
                        <td className="px-4 py-3 text-slate-650 text-xs font-medium">
                          {prod.category || "Uncategorized"}
                        </td>
                        <td className="px-4 py-3 font-bold text-slate-800 text-xs">
                          {formatCurrency(prod.price)}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                            isOutOfStock
                              ? "bg-red-50 text-red-750 border-red-100"
                              : isLowStock
                              ? "bg-amber-50 text-amber-750 border-amber-100"
                              : "bg-emerald-50 text-emerald-750 border-emerald-100"
                          }`}>
                            {isOutOfStock ? "Out of Stock" : `${prod.quantity} Left`}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link
                            href={`/dashboard/products/${prod._id}`}
                            className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 inline-flex items-center gap-0.5 text-xs font-bold"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            View
                            <ArrowRight className="w-3 h-3 text-slate-400" />
                          </Link>
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
    </div>
  );
}
