"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";
import ProductTable from "../../../src/components/products/ProductTable";
import Pagination from "../../../src/components/products/Pagination";
import { useProducts, useDeleteProduct } from "../../../src/hooks/useProducts";

export default function ProductsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useProducts({ search, page, limit: 10 });
  const deleteProduct = useDeleteProduct();

  const handleDelete = (id) => {
    if (confirm("Delete this product?")) {
      deleteProduct.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-900">Products</h1>
        <button
          onClick={() => router.push("/dashboard/products/new")}
          className="flex items-center gap-2 bg-slate-900 text-white text-sm font-medium rounded-md px-4 py-2 hover:bg-slate-800"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name or SKU..."
          className="w-full rounded-md border border-slate-300 pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
        />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        <ProductTable
          products={data?.products}
          isLoading={isLoading}
          onDelete={handleDelete}
        />
        <Pagination
          page={page}
          totalPages={data?.totalPages || 1}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
