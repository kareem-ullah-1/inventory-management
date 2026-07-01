"use client";

import { useState } from "react";
import { useAuditLogs } from "../../../src/hooks/useAuditLogs";
import { Search, ShieldAlert, Calendar, User, Eye, Laptop } from "lucide-react";
import SkeletonLoader from "../../../src/components/layout/SkeletonLoader";
import { formatDate } from "../../../src/utils/formatDate";

export default function AuditLogsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { data, isLoading } = useAuditLogs();

  const auditLogs = data?.auditLogs || [];

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.user?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Security Audit Logs</h1>
        <p className="text-sm text-slate-500">Chronological ledger of data mutations, logins, and system events</p>
      </div>

      {/* Search Filter */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by action, user or details..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 pr-4 py-2 w-full text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition"
          />
        </div>
      </div>

      {/* Audit Log Table */}
      {isLoading ? (
        <div className="bg-white p-6 border border-slate-200 rounded-xl">
          <SkeletonLoader variant="table" cols={4} />
        </div>
      ) : filteredLogs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl py-12 text-center text-slate-500">
          <ShieldAlert className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-800">No logs found</h3>
          <p className="text-xs text-slate-550 mt-1">Adjust search parameters or initiate activity to log events.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-655 text-[11px] font-semibold uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Action Event</th>
                  <th className="px-6 py-3.5">Details</th>
                  <th className="px-6 py-3.5">Initiated By</th>
                  <th className="px-6 py-3.5">Host IP</th>
                  <th className="px-6 py-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredLogs.map((log) => {
                  const isAuthAction = log.action.includes("Login") || log.action.includes("Auth");
                  
                  return (
                    <tr key={log._id} className="hover:bg-slate-50/50 transition">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold uppercase text-[9px] ${
                          isAuthAction 
                            ? "bg-blue-50 text-blue-750 border border-blue-100" 
                            : "bg-slate-100 text-slate-705 border border-slate-200"
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-800 font-semibold max-w-xs truncate" title={log.details}>
                        {log.details}
                      </td>
                      <td className="px-6 py-4 text-slate-650">
                        <div className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          <span className="font-semibold">{log.user?.name || "System"}</span>
                          <span className="text-[10px] text-slate-450 uppercase">({log.user?.role || "core"})</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-medium">
                        <div className="flex items-center gap-1">
                          <Laptop className="w-3.5 h-3.5 text-slate-400" />
                          {log.ipAddress}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 font-semibold">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {formatDate(log.createdAt)}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
