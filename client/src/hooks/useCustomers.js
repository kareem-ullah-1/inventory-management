import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerService } from "../services/customerService";

export const useCustomers = () => {
  return useQuery({
    queryKey: ["customers"],
    queryFn: customerService.getCustomers,
  });
};

export const useCustomerDetails = (id) => {
  return useQuery({
    queryKey: ["customers", id],
    queryFn: () => customerService.getCustomerById(id),
    enabled: !!id,
  });
};

export const useSaveCustomer = (id = null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) =>
      id
        ? customerService.updateCustomer(id, payload)
        : customerService.createCustomer(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      if (id) {
        queryClient.invalidateQueries({ queryKey: ["customers", id] });
      }
    },
  });
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: customerService.deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    },
  });
};
