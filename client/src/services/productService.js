import axiosInstance from "../lib/axios";

export const productService = {
  getProducts: async (params = {}) => {
    const res = await axiosInstance.get("/products", { params });
    return res.data;
  },

  getProductById: async (id) => {
    const res = await axiosInstance.get(`/products/${id}`);
    return res.data;
  },

  createProduct: async (data) => {
    const res = await axiosInstance.post("/products", data);
    return res.data;
  },

  updateProduct: async (id, data) => {
    const res = await axiosInstance.put(`/products/${id}`, data);
    return res.data;
  },

  deleteProduct: async (id) => {
    const res = await axiosInstance.delete(`/products/${id}`);
    return res.data;
  },
};
