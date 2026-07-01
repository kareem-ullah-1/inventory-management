import { useQuery } from "@tanstack/react-query";
import { reportService } from "../services/reportService";

export const useSalesReport = (days = 30) => {
  return useQuery({
    queryKey: ["reports", "sales", days],
    queryFn: () => reportService.getSalesReport({ days }),
  });
};

export const useTopCategoriesReport = () => {
  return useQuery({
    queryKey: ["reports", "top-categories"],
    queryFn: reportService.getTopCategoriesReport,
  });
};

export const useDashboardStatsReport = () => {
  return useQuery({
    queryKey: ["reports", "stats"],
    queryFn: reportService.getDashboardStatsReport,
  });
};
