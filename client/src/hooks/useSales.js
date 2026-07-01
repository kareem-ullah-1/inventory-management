import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { salesService } from "../services/salesService";

export const useSales = (params = {}) => {
  return useQuery({
    queryKey: ["sales", params],
    queryFn: () => salesService.getSales(params),
  });
};

export const useSaleDetails = (id) => {
  return useQuery({
    queryKey: ["sales", id],
    queryFn: () => salesService.getSaleById(id),
    enabled: !!id,
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: salesService.createSale,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["stock-logs"] });
    },
  });
};

export const useUpdateSaleStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) => salesService.updateSaleStatus(id, status),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["sales"] });
      queryClient.invalidateQueries({ queryKey: ["sales", variables.id] });
    },
  });
};