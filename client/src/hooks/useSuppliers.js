import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supplierService } from "../services/supplierService";

export const useSuppliers = (params = {}) => {
  return useQuery({
    queryKey: ["suppliers", params],
    queryFn: () => supplierService.getSuppliers(params),
  });
};

export const useSupplierDetails = (id) => {
  return useQuery({
    queryKey: ["suppliers", id],
    queryFn: () => supplierService.getSupplierById(id),
    enabled: !!id,
  });
};

export const useSaveSupplier = (id = null) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload) => (id ? supplierService.updateSupplier(id, payload) : supplierService.createSupplier(payload)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
      if (id) queryClient.invalidateQueries({ queryKey: ["suppliers", id] });
    },
  });
};

export const useDeleteSupplier = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => supplierService.deleteSupplier(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
};
