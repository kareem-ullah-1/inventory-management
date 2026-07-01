import axiosInstance from "../lib/axios";

export const auditLogService = {
  getAuditLogs: async () => {
    const res = await axiosInstance.get("/auditlogs"); // ← fixed
    return res.data;
  },

  getStockLogs: async () => {
    const res = await axiosInstance.get("/stock-logs");
    return res.data;
  },
};