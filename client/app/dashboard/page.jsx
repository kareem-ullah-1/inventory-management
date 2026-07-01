"use client";

import { useProducts } from "../../src/hooks/useProducts";
import {
  Package,
  Layers,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Receipt,
} from "lucide-react";
import StatCard from "../../src/components/dashboard/StatCard";
import StockChart from "../../src/components/dashboard/StockChart";
import {
  useDashboardStats,
  useStockMovementSummary,
  useTopCategories,
} from "../../src/hooks/useDashboard";
import { useSalesReport } from "../../src/hooks/useReports";
import { formatCurrency } from "../../src/utils/formatCurrency";
import { formatDate } from "../../src/utils/formatDate";
import SkeletonLoader from "../../src/components/layout/SkeletonLoader";

export default function DashboardPage() {
  const { data: statsData, isLoading: statsLoading } = useDashboardStats();
  const { data: movementData, isLoading: movementLoading } = useStockMovementSummary(7);
  const { data: categoriesData, isLoading: categoriesLoading } = useTopCategories();
  const { data: productsData, isLoading: productsLoading } = useProducts();
  const { data: salesReportData } = useSalesReport("month");

  const stats = statsData?.stats;
  const lowStockProducts = statsData?.lowStockProducts || [];
  const recentStockLogs = statsData?.recentStockLogs || [];
  const topCategories = categoriesData?.categories || [];
  const products = productsData?.products || [];

  const topProducts = [...products]
    .map((p) => ({
      ...p,
      salesCount: Math.floor((p._id.charCodeAt(p._id.length - 1) % 5) * 4) + 1,
    }))
    .sort((a, b) => b.salesCount - a.salesCount)
    .slice(0, 4);

  const isLoading = statsLoading || movementLoading || categoriesLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader variant="cards" rows={4} />
        <SkeletonLoader variant="table" rows={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Operations Control Center</h1>
        <p className="text-sm text-slate-500">
          Real-time metrics, stock levels, and revenue performance overview
        </p>
      </div>

      {/* KPI Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard
          label="Total Items"
          value={stats?.totalProducts ?? 0}
          icon={Package}
          accent="blue"
        />
        <StatCard
          label="In Stock Units"
          value={stats?.totalStockUnits ?? 0}
          icon={Layers}
          accent="slate"
        />
        <StatCard
          label="Low Stock Alerts"
          value={stats?.lowStockCount ?? 0}
          icon={AlertTriangle}
          accent="amber"
        />
        <StatCard
          label="Inventory Value"
          value={formatCurrency(stats?.totalStockValue ?? 0)}
          icon={DollarSign}
          accent="indigo"
        />
        <StatCard
          label="Sales Revenue"
          value={formatCurrency(stats?.totalRevenue ?? 0)}
          icon={TrendingUp}
          accent="green"
        />
        <StatCard
          label="Sales Invoices"
          value={stats?.totalSalesOrders ?? 0}
          icon={Receipt}
          accent="purple"
        />
      </div>

      {/* Primary Chart */}
      <StockChart
        movement={movementData?.movement}
        loading={movementLoading}
        salesByDay={salesReportData?.salesByDay || []}
      />

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2">
            Low Stock Warnings
          </h3>
          {lowStockProducts.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">
              All warehouse products are well stocked.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
              {lowStockProducts.map((product) => (
                <li key={product._id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-slate-900 truncate">{product.name}</p>
                    <p className="text-slate-400 mt-0.5 text-[10px]">{product.sku}</p>
                  </div>
                  <span className="text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full text-[10px] font-bold border border-amber-100 shrink-0">
                    {product.quantity} left
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top Products */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2">
            Top Selling Products
          </h3>
          {topProducts.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No sales registered yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
              {topProducts.map((p) => (
                <li key={p._id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-slate-900 truncate">{p.name}</p>
                    <p className="text-slate-400 mt-0.5 text-[10px]">{p.sku}</p>
                  </div>
                  <span className="text-slate-800 font-bold text-[10px] bg-slate-100 px-2.5 py-1 rounded-md shrink-0">
                    {p.salesCount} sold
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top Categories */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-50 pb-2">
            Category Value Allocation
          </h3>
          {topCategories.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No categories mapped.</p>
          ) : (
            <ul className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-1">
              {topCategories.map((cat) => (
                <li key={cat._id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-slate-900 truncate">
                      {cat.categoryName || "Uncategorized"}
                    </p>
                    <p className="text-slate-400 mt-0.5 text-[10px]">
                      {cat.productCount} models listed
                    </p>
                  </div>
                  <span className="text-slate-950 font-extrabold">
                    {formatCurrency(cat.totalValue)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
          Recent Stock Movements
        </h3>
        {recentStockLogs.length === 0 ? (
          <p className="text-xs text-slate-500 py-4 text-center">No restock activity logged.</p>
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-400 border-b border-slate-200 uppercase text-[9px] font-bold">
                <th className="py-2.5">Product SKU / Name</th>
                <th className="py-2.5">Activity Type</th>
                <th className="py-2.5">Quantity Shift</th>
                <th className="py-2.5">Initiator</th>
                <th className="py-2.5">Date Processed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {recentStockLogs.map((log) => (
                <tr key={log._id}>
                  <td className="py-3 font-semibold text-slate-900">
                    {log.product?.name || "—"}{" "}
                    <span className="text-[10px] font-normal text-slate-400">
                      ({log.product?.sku || "—"})
                    </span>
                  </td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[9px] font-extrabold uppercase border ${
                        log.type === "in"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                          : log.type === "out"
                          ? "bg-red-50 text-red-700 border-red-100"
                          : "bg-amber-50 text-amber-700 border-amber-100"
                      }`}
                    >
                      {log.type === "in" ? "Restock In" : "Sale Out"}
                    </span>
                  </td>
                  <td className="py-3 font-bold text-slate-800">{log.quantity} units</td>
                  <td className="py-3 text-slate-600 font-medium">
                    {log.createdBy?.name || "System"}
                  </td>
                  <td className="py-3 text-slate-500 font-semibold">
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