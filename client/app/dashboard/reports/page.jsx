"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportService } from "../../../src/services/reportService";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, AreaChart, Area,
} from "recharts";
import {
  TrendingUp, DollarSign, ArrowDownRight, ArrowUpRight,
  Percent, Package, Layers, Activity,
} from "lucide-react";
import SkeletonLoader from "../../../src/components/layout/SkeletonLoader";
import { formatCurrency } from "../../../src/utils/formatCurrency";

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("sales");
  const [period, setPeriod] = useState("month");

  const { data: salesData, isLoading: salesLoading } = useQuery({
    queryKey: ["reports", "sales", period],
    queryFn: () => reportService.getSalesReport({ period }),
  });

  const { data: stockData, isLoading: stockLoading } = useQuery({
    queryKey: ["reports", "stock", period],
    queryFn: () => reportService.getStockReport(),
  });

  const { data: plData, isLoading: plLoading } = useQuery({
    queryKey: ["reports", "profit-loss", period],
    queryFn: () => reportService.getProfitLossReport(),
  });

  const isLoading = salesLoading || stockLoading || plLoading;

  // Sales data
  const salesSummary = salesData?.summary || {};
  const salesByDay = salesData?.salesByDay || [];
  const topProducts = salesData?.topProducts || [];
  const byPaymentMethod = salesData?.byPaymentMethod || [];

  // Stock data
  const inventorySummary = stockData?.inventorySummary || {};
  const lowStockProducts = stockData?.lowStockProducts || [];
  const outOfStockProducts = stockData?.outOfStockProducts || [];
  const movementByDay = stockData?.movementByDay || [];

  // P&L data
  const plSummary = plData?.summary || {};
  const profitByProduct = plData?.profitByProduct || [];

  // Chart data for movement tab
  const movementChartData = movementByDay.map((d) => ({
    date: d._id,
    in: d.stockIn,
    out: d.stockOut,
  }));

  // Chart data for sales tab
  const salesChartData = salesByDay.map((d) => ({
    date: d._id,
    sales: d.revenue,
    orders: d.orders,
  }));

  if (isLoading) {
    return <SkeletonLoader variant="detail" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-sm text-slate-500">Analyze performance, profitability, and inventory velocity</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Period:</span>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="border border-slate-300 bg-white text-xs font-semibold px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="today">Today</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
            <option value="quarter">Last 90 Days</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-slate-500">Gross Revenue</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(salesSummary.totalRevenue || 0)}</p>
            <span className="text-[10px] text-slate-500 font-semibold mt-1 block">
              {salesSummary.totalOrders || 0} orders
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-slate-500">Gross Profit</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(plSummary.grossProfit || 0)}</p>
            <span className="text-[10px] text-slate-500 font-semibold mt-1 block">
              After cost of purchases
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-slate-500">Profit Margin</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{plSummary.profitMargin || 0}%</p>
            <span className="text-[10px] text-slate-500 font-semibold mt-1 block">
              Revenue vs cost ratio
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Percent className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 flex items-center justify-between shadow-sm">
          <div>
            <p className="text-xs font-medium text-slate-500">Inventory Value</p>
            <p className="text-xl font-bold text-slate-900 mt-1">{formatCurrency(inventorySummary.totalRetailValue || 0)}</p>
            <span className="text-[10px] text-slate-500 font-semibold mt-1 block">
              {inventorySummary.totalProducts || 0} active products
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200 flex gap-4">
        {["sales", "movement", "products"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-semibold transition-all capitalize ${
              activeTab === tab
                ? "border-b-2 border-slate-900 text-slate-950"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            {tab === "sales" ? "Sales & Revenue" : tab === "movement" ? "Stock Movement" : "Product Performance"}
          </button>
        ))}
      </div>

      {/* Sales Tab */}
      {activeTab === "sales" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Revenue Trend</h3>
              <p className="text-xs text-slate-500">Daily sales revenue</p>
            </div>
            {salesChartData.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-sm text-slate-400">No sales data for this period</div>
            ) : (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesChartData}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip formatter={(value) => [`$${value}`, "Revenue"]} />
                    <Area type="monotone" dataKey="sales" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Payment Methods</h3>
            <div className="space-y-3">
              {byPaymentMethod.length === 0 ? (
                <p className="text-xs text-slate-400">No data</p>
              ) : (
                byPaymentMethod.map((p) => (
                  <div key={p._id} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700 capitalize">{p._id}</span>
                      <span className="text-slate-900">{formatCurrency(p.revenue)}</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full"
                        style={{
                          width: `${Math.min(100, (p.revenue / (salesSummary.totalRevenue || 1)) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-400">{p.count} orders</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Movement Tab */}
      {activeTab === "movement" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Stock In vs Stock Out</h3>
              <p className="text-xs text-slate-500">Units restocked vs units sold per day</p>
            </div>
            {movementChartData.length === 0 ? (
              <div className="h-80 flex items-center justify-center text-sm text-slate-400">No movement data for this period</div>
            ) : (
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={movementChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="in" name="Units Restocked" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="out" name="Units Sold" fill="#ec4899" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-2">Inventory Summary</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Total Units</p>
                  <p className="text-lg font-bold text-slate-900">{inventorySummary.totalUnits || 0}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Out of Stock</p>
                  <p className="text-lg font-bold text-slate-900">{outOfStockProducts.length} products</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs text-slate-500 font-semibold uppercase">Low Stock</p>
                  <p className="text-lg font-bold text-slate-900">{lowStockProducts.length} products</p>
                </div>
              </div>
            </div>

            {lowStockProducts.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-semibold text-slate-600 uppercase">Low Stock Items</p>
                {lowStockProducts.slice(0, 5).map((p) => (
                  <div key={p._id} className="flex justify-between text-xs">
                    <span className="text-slate-700 font-medium">{p.name}</span>
                    <span className="text-amber-600 font-bold">{p.quantity} left</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Products Tab */}
      {activeTab === "products" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Top Selling Products</h3>
            {topProducts.length === 0 ? (
              <p className="text-sm text-slate-400">No sales data for this period</p>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-2">Product</th>
                    <th className="px-4 py-2">Units Sold</th>
                    <th className="px-4 py-2 text-right">Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topProducts.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5">
                        <p className="font-bold text-slate-800">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.sku}</p>
                      </td>
                      <td className="px-4 py-2.5 font-bold text-slate-700">{p.totalQuantity}</td>
                      <td className="px-4 py-2.5 text-right font-bold text-slate-900">{formatCurrency(p.totalRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-sm">Most Profitable Products</h3>
            {profitByProduct.length === 0 ? (
              <p className="text-sm text-slate-400">No profit data for this period</p>
            ) : (
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
                  <tr>
                    <th className="px-4 py-2">Product</th>
                    <th className="px-4 py-2">Margin</th>
                    <th className="px-4 py-2 text-right">Profit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {profitByProduct.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50">
                      <td className="px-4 py-2.5">
                        <p className="font-bold text-slate-800">{p.name}</p>
                        <p className="text-[10px] text-slate-400">{p.sku}</p>
                      </td>
                      <td className="px-4 py-2.5 font-bold text-emerald-600">{p.margin?.toFixed(1)}%</td>
                      <td className="px-4 py-2.5 text-right font-bold text-slate-900">{formatCurrency(p.profit)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}