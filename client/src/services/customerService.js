import axiosInstance from "../lib/axios";

export const customerService = {
  getCustomers: async () => {
    const res = await axiosInstance.get("/customers");
    return res.data;
  },

  getCustomerById: async (id) => {
    const res = await axiosInstance.get(`/customers/${id}`);
    return res.data;
  },

  createCustomer: async (data) => {
    const res = await axiosInstance.post("/customers", data);
    return res.data;
  },

  updateCustomer: async (id, data) => {
    const res = await axiosInstance.put(`/customers/${id}`, data);
    return res.data;
  },

  deleteCustomer: async (id) => {
    const res = await axiosInstance.delete(`/customers/${id}`);
    return res.data;
  },
};
