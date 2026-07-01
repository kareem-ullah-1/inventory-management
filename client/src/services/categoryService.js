import axiosInstance from "../lib/axios";

export const categoryService = {
  getCategories: async (params = {}) => {
    const res = await axiosInstance.get("/categories", { params });
    return res.data;
  },

  getCategoryById: async (id) => {
    const res = await axiosInstance.get(`/categories/${id}`);
    return res.data;
  },

  createCategory: async (data) => {
    const res = await axiosInstance.post("/categories", data);
    return res.data;
  },

  updateCategory: async (id, data) => {
    const res = await axiosInstance.put(`/categories/${id}`, data);
    return res.data;
  },

  deleteCategory: async (id) => {
    const res = await axiosInstance.delete(`/categories/${id}`);
    return res.data;
  },
};
