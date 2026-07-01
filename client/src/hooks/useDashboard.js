import { useQuery } from "@tanstack/react-query";
import { dashboardService } from "../services/dashboardService";

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: dashboardService.getStats,
  });
};

export const useStockMovementSummary = (days = 7) => {
  return useQuery({
    queryKey: ["dashboard", "stock-movement", days],
    queryFn: () => dashboardService.getStockMovementSummary(days),
  });
};

export const useTopCategories = () => {
  return useQuery({
    queryKey: ["dashboard", "top-categories"],
    queryFn: dashboardService.getTopCategories,
  });
};
