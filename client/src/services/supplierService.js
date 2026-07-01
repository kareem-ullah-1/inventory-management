import axiosInstance from "../lib/axios";

export const supplierService = {
  getSuppliers: async (params = {}) => {
    const res = await axiosInstance.get("/suppliers", { params });
    return res.data;
  },

  getSupplierById: async (id) => {
    const res = await axiosInstance.get(`/suppliers/${id}`);
    return res.data;
  },

  createSupplier: async (data) => {
    const res = await axiosInstance.post("/suppliers", data);
    return res.data;
  },

  updateSupplier: async (id, data) => {
    const res = await axiosInstance.put(`/suppliers/${id}`, data);
    return res.data;
  },

  deleteSupplier: async (id) => {
    const res = await axiosInstance.delete(`/suppliers/${id}`);
    return res.data;
  },
};
