import axiosInstance from "../lib/axios";

export const userService = {
  getUsers: async () => {
    const res = await axiosInstance.get("/users");
    return res.data;
  },

  createUser: async (data) => {
    const res = await axiosInstance.post("/users", data);
    return res.data;
  },

  updateUser: async (id, data) => {
    const res = await axiosInstance.put(`/users/${id}`, data);
    return res.data;
  },

  deleteUser: async (id) => {
    const res = await axiosInstance.delete(`/users/${id}`);
    return res.data;
  },
};
