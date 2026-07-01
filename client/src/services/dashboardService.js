import axiosInstance from "../lib/axios";

export const dashboardService = {
  getStats: async () => {
    const res = await axiosInstance.get("/dashboard/stats");
    return res.data;
  },

  getStockMovementSummary: async (days = 7) => {
    const res = await axiosInstance.get("/dashboard/movement", {
      params: { days },
    });
    return res.data;
  },

  getTopCategories: async () => {
    const res = await axiosInstance.get("/dashboard/top-categories");
    return res.data;
  },
};
