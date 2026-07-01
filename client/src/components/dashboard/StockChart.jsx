"use client";

import { useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function transformMovementData(movement = []) {
  if (movement.length && movement[0].date && typeof movement[0].in === "number") {
    return movement; // already in chart format
  }

  const byDate = {};
  movement.forEach((entry) => {
    const date = entry._id?.date || "Unknown";
    const type = entry._id?.type || "adjustment";

    if (!byDate[date]) {
      byDate[date] = { date, in: 0, out: 0, adjustment: 0 };
    }

    byDate[date][type] = entry.totalQuantity || 0;
  });

  return Object.values(byDate).sort((a, b) => (a.date > b.date ? 1 : -1));
}

export default function StockChart({ movement, loading, salesByDay = [] }) {
  const [chartMode, setChartMode] = useState("stock");
  const data = transformMovementData(movement);

  // Format sales data for chart
  const revenueData = salesByDay.map((d) => ({
    date: d._id,
    sales: d.revenue,
  }));

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 h-80 flex items-center justify-center">
        <p className="text-sm text-slate-500">Loading chart...</p>
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-5 h-80 flex items-center justify-center">
        <p className="text-sm text-slate-500">No activity data in this period</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-800">
            {chartMode === "stock" ? "Inventory Movement Rate" : "Sales Revenue Velocity ($)"}
          </h3>
          <p className="text-xs text-slate-500">
            {chartMode === "stock" ? "Logistics check-ins and check-outs" : "Gross revenue aggregates over time"}
          </p>
        </div>

        <div className="flex border border-slate-200 rounded-lg overflow-hidden shrink-0">
          <button
            onClick={() => setChartMode("stock")}
            className={`px-3 py-1.5 text-xs font-bold transition-all ${
              chartMode === "stock" ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Stock Flow
          </button>
          <button
            onClick={() => setChartMode("revenue")}
            className={`px-3 py-1.5 text-xs font-bold transition-all ${
              chartMode === "revenue" ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            Revenue Sales
          </button>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartMode === "stock" ? (
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" axisLine={false} tickLine={false} />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="in"
                name="Stock Restocked"
                stroke="#10b981"
                strokeWidth={2.5}
                activeDot={{ r: 6 }}
              />
              <Line
                type="monotone"
                dataKey="out"
                name="Stock Shipped"
                stroke="#ec4899"
                strokeWidth={2.5}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          ) : (
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="colorSalesRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="#94a3b8" tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} stroke="#94a3b8" axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
              <Area
                type="monotone"
                dataKey="sales"
                name="Gross Sales"
                stroke="#3b82f6"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#colorSalesRev)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
