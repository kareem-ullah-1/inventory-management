import { useQuery } from "@tanstack/react-query";
import { auditLogService } from "../services/auditlogService";

export const useAuditLogs = () => {
  return useQuery({
    queryKey: ["audit-logs"],
    queryFn: auditLogService.getAuditLogs,
  });
};

export const useStockLogsEx = () => {
  return useQuery({
    queryKey: ["stock-logs"],
    queryFn: auditLogService.getStockLogs,
  });
};
