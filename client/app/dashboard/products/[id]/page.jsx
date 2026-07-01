"use client";

import { useRouter, useParams } from "next/navigation";
import ProductForm from "../../../../src/components/products/ProductForm";
import {
  useProduct,
  useCreateProduct,
  useUpdateProduct,
} from "../../../../src/hooks/useProducts";

export default function ProductDetailPage() {
  const router = useRouter();
  const params = useParams();
  const isNew = params.id === "new";

  const { data, isLoading } = useProduct(isNew ? null : params.id);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();

  const handleSubmit = async (formData) => {
    try {
      if (isNew) {
        await createProduct.mutateAsync(formData);
      } else {
        await updateProduct.mutateAsync({ id: params.id, data: formData });
      }
      router.push("/dashboard/products");
    } catch (error) {
      alert(error.response?.data?.message || "Failed to save product");
    }
  };

  if (!isNew && isLoading) {
    return <p className="text-sm text-slate-500">Loading product...</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">
        {isNew ? "Add Product" : "Edit Product"}
      </h1>

      <div className="bg-white border border-slate-200 rounded-xl p-5 max-w-2xl">
        <ProductForm
          initialData={!isNew ? data?.product : null}
          onSubmit={handleSubmit}
          loading={createProduct.isPending || updateProduct.isPending}
        />
      </div>
    </div>
  );
}
