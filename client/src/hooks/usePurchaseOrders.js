import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { purchaseOrderService } from "../services/purchaseOrderService";

export const usePurchaseOrders = (params = {}) => {
  return useQuery({
    queryKey: ["purchase-orders", params],
    queryFn: () => purchaseOrderService.getPurchaseOrders(params),
  });
};

export const usePurchaseOrderDetails = (id) => {
  return useQuery({
    queryKey: ["purchase-orders", id],
    queryFn: () => purchaseOrderService.getPurchaseOrderById(id),
    enabled: !!id,
  });
};

export const useCreatePurchaseOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseOrderService.createPurchaseOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
};

export const useUpdatePurchaseOrderStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }) =>
      purchaseOrderService.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["purchase-orders"] });
    },
  });
};