import axiosInstance from "../lib/axios";

export const aiForecastService = {
  getInventoryHealth: async () => {
    const res = await axiosInstance.get("/ai-forecast/inventory-health");
    return res.data;
  },

  getLowStockForecast: async () => {
    const res = await axiosInstance.get("/ai-forecast/low-stock");
    return res.data;
  },

  getSalesForecast: async () => {
    const res = await axiosInstance.get("/ai-forecast/sales-trend");
    return res.data;
  },
};