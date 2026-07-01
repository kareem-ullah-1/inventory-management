"use client";

import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../src/lib/axios";
import { formatDate } from "../../../src/utils/formatDate";

export default function StockLogsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["stock-logs"],
    queryFn: async () => {
      const res = await axiosInstance.get("/stock/logs");
      return res.data;
    },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Stock Logs</h1>

      <div className="bg-white border border-slate-200 rounded-xl p-5">
        {isLoading ? (
          <p className="text-sm text-slate-500">Loading...</p>
        ) : !data?.logs?.length ? (
          <p className="text-sm text-slate-500">No stock activity yet</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-slate-500 border-b border-slate-200">
                <th className="py-2 font-medium">Product</th>
                <th className="py-2 font-medium">Type</th>
                <th className="py-2 font-medium">Quantity</th>
                <th className="py-2 font-medium">Reason</th>
                <th className="py-2 font-medium">By</th>
                <th className="py-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.logs.map((log) => (
                <tr key={log._id}>
                  <td className="py-2 text-slate-900">
                    {log.product?.name || "—"}
                  </td>
                  <td className="py-2">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        log.type === "in"
                          ? "bg-emerald-100 text-emerald-700"
                          : log.type === "out"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {log.type}
                    </span>
                  </td>
                  <td className="py-2 text-slate-700">{log.quantity}</td>
                  <td className="py-2 text-slate-700 capitalize">
                    {log.reason}
                  </td>
                  <td className="py-2 text-slate-700">
                    {log.createdBy?.name || "—"}
                  </td>
                  <td className="py-2 text-slate-500">
                    {formatDate(log.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
