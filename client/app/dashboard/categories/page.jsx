"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, Pencil } from "lucide-react";
import { categoryService } from "../../../src/services/categoryService";

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: "", description: "" });
  const [search, setSearch] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategories(),
  });

  const saveMutation = useMutation({
    mutationFn: (payload) =>
      editingId
        ? categoryService.updateCategory(editingId, payload)
        : categoryService.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setFormOpen(false);
      setEditingId(null);
      setFormData({ name: "", description: "" });
    },
  });

  const deleteMutation = useMutation({
  mutationFn: (id) => categoryService.deleteCategory(id),

  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  },

  onError: (err) => {
    console.log("Full Error:", err);
    console.log("Response:", err.response);
    console.log("Data:", err.response?.data);

    alert(err.response?.data?.message || "Failed to delete");
  },
});

  const filteredCategories =
    data?.categories?.filter((category) =>
      category.name.toLowerCase().includes(search.toLowerCase())
    ) || [];

  const openEdit = (category) => {
    setEditingId(category._id);
    setFormData({ name: category.name, description: category.description || "" });
    setFormOpen(true);
  };

  const openNew = () => {
    setEditingId(null);
    setFormData({ name: "", description: "" });
    setFormOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">Categories</h1>
          <p className="text-sm text-slate-500">
            Total Categories: {data?.categories?.length || 0}
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-slate-900 text-white text-sm font-medium rounded-md px-4 py-2 hover:bg-slate-800"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      <div className="mt-4">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search category..."
          className="w-full max-w-xs rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      {formOpen && (
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-slate-200 rounded-xl p-5 max-w-md space-y-3"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name
            </label>
            <input
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saveMutation.isPending}
              className="bg-slate-900 text-white text-sm font-medium rounded-md px-4 py-2 hover:bg-slate-800 disabled:opacity-60"
            >
              {saveMutation.isPending ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              onClick={() => setFormOpen(false)}
              className="text-sm font-medium text-slate-600 px-4 py-2 hover:bg-slate-100 rounded-md"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : !data?.categories?.length ? (
          <p className="text-sm text-slate-500">No categories yet</p>
        ) : !filteredCategories.length ? (
          <p className="text-sm text-slate-500 text-center py-10">
            No categories found
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {filteredCategories.map((category) => (
              <li
                key={category._id}
                className="py-3 flex items-center justify-between text-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">
                    {category.name}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(category.createdAt).toLocaleDateString()}
                  </p>
                  {category.description && (
                    <p className="text-slate-500">{category.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(category)}
                    className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Delete this category?")) {
                        deleteMutation.mutate(category._id);
                      }
                    }}
                    className="p-1.5 rounded-md hover:bg-red-50 text-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
