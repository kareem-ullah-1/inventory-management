import axiosInstance from "../lib/axios";

export const authService = {
  register: async (data) => {
    const res = await axiosInstance.post("/auth/register", data);
    return res.data;
  },

  login: async (data) => {
    const res = await axiosInstance.post("/auth/login", data);
    return res.data;
  },

  logout: async () => {
    const res = await axiosInstance.post("/auth/logout");
    return res.data;
  },

  getMe: async () => {
    const res = await axiosInstance.get("/auth/me");
    return res.data;
  },

  updatePassword: async (data) => {
    const res = await axiosInstance.put("/auth/update-password", data);
    return res.data;
  },

  forgotPassword: async (email) => {
    const res = await axiosInstance.post("/auth/forgot-password", { email });
    return res.data;
  },

  resetPassword: async (token, password) => {
    const res = await axiosInstance.post(`/auth/reset-password/${token}`, {
      password,
    });
    return res.data;
  },
};