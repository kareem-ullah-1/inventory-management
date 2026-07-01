import { useQuery } from "@tanstack/react-query";
import { aiForecastService } from "../services/aiForecastService";

export const useInventoryHealth = () => {
  return useQuery({
    queryKey: ["inventory-health"],
    queryFn: aiForecastService.getInventoryHealth,
  });
};

export const useLowStockForecast = () => {
  return useQuery({
    queryKey: ["low-stock-forecast"],
    queryFn: aiForecastService.getLowStockForecast,
  });
};

export const useSalesForecast = () => {
  return useQuery({
    queryKey: ["sales-forecast"],
    queryFn: aiForecastService.getSalesForecast,
  });
};