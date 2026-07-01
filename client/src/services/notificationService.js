import axiosInstance from "../lib/axios";

export const notificationService = {
  getNotifications: async (params = {}) => {
    const res = await axiosInstance.get("/notifications", { params });
    return res.data;
  },

  markAsRead: async (id) => {
    const res = await axiosInstance.put(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await axiosInstance.put("/notifications/read-all");
    return res.data;
  },

  deleteNotification: async (id) => {
    const res = await axiosInstance.delete(`/notifications/${id}`);
    return res.data;
  },
};
