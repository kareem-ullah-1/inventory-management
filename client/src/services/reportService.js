import axiosInstance from "../lib/axios";

export const reportService = {
  getSalesReport: async ({ period = "month" } = {}) => {
    const res = await axiosInstance.get("/reports/sales", { params: { period } });
    return res.data;
  },

  getStockReport: async ({ period = "month" } = {}) => {
    const res = await axiosInstance.get("/reports/stock", { params: { period } });
    return res.data;
  },

  getProfitLossReport: async ({ period = "month" } = {}) => {
    const res = await axiosInstance.get("/reports/profit-loss", { params: { period } });
    return res.data;
  },

  getPurchaseReport: async ({ period = "month" } = {}) => {
    const res = await axiosInstance.get("/reports/purchases", { params: { period } });
    return res.data;
  },

  getCustomerReport: async ({ period = "month" } = {}) => {
    const res = await axiosInstance.get("/reports/customers", { params: { period } });
    return res.data;
  },

  getTopCategoriesReport: async ({ period = "month" } = {}) => {
    const res = await axiosInstance.get("/reports/stock", { params: { period } });
    return res.data;
  },

  getDashboardStatsReport: async ({ period = "month" } = {}) => {
    const res = await axiosInstance.get("/reports/profit-loss", { params: { period } });
    return res.data;
  },
};