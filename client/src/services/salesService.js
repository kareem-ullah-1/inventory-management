import axiosInstance from "../lib/axios";

export const salesService = {
  getSales: async (params = {}) => {
    const res = await axiosInstance.get("/sales", { params });
    return res.data;
  },

  getSaleById: async (id) => {
    const res = await axiosInstance.get(`/sales/${id}`);
    return res.data;
  },

  createSale: async (data) => {
    const res = await axiosInstance.post("/sales", data);
    return res.data;
  },
  updateSaleStatus: async (id, status) => {
  const res = await axiosInstance.put(`/sales/${id}/status`, { status });
  return res.data;
},
};
