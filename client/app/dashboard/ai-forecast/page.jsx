
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../../../src/lib/axios";
import {
  Brain,
  TrendingUp,
  AlertTriangle,
  Package,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Zap,
  BarChart2,
  ShieldAlert,
  Lightbulb,
} from "lucide-react";
import { formatCurrency } from "../../../src/utils/formatCurrency";

// ── API helpers ──────────────────────────────────────────────────
const fetchInventoryHealth = async () => {
  const res = await axiosInstance.get("/ai-forecast/inventory-health");
  return res.data;
};

const fetchLowStockForecast = async () => {
  const res = await axiosInstance.get("/ai-forecast/low-stock");
  return res.data;
};

const fetchSalesForecast = async () => {
  const res = await axiosInstance.get("/ai-forecast/sales-trend");
  return res.data;
};

// ── Small helper components ──────────────────────────────────────
const Badge = ({ label, color }) => {
  const colors = {
    green:  "bg-emerald-50 text-emerald-700 border-emerald-100",
    red:    "bg-red-50 text-red-700 border-red-100",
    amber:  "bg-amber-50 text-amber-700 border-amber-100",
    blue:   "bg-blue-50 text-blue-700 border-blue-100",
    slate:  "bg-slate-100 text-slate-700 border-slate-200",
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase ${colors[color] || colors.slate}`}>
      {label}
    </span>
  );
};

const urgencyColor = (u) =>
  ({ critical: "red", soon: "amber", normal: "blue", not_needed: "green" }[u] || "slate");

const riskColor = (r) =>
  ({ high: "red", medium: "amber", low: "green" }[r] || "slate");

const healthColor = (s) =>
  ({ excellent: "green", good: "green", fair: "amber", poor: "amber", critical: "red" }[s] || "slate");

const trendColor = (t) =>
  ({ growing: "green", increasing: "green", declining: "red", decreasing: "red", stable: "blue", volatile: "amber" }[t] || "slate");

// ── Section wrapper ──────────────────────────────────────────────
function Section({ title, icon: Icon, children, loading, error, onRefetch }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <Icon className="w-4 h-4 text-slate-500" />
          {title}
        </h3>
        <button
          onClick={onRefetch}
          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 transition"
          title="Refresh"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>
      <div className="p-5">
        {loading ? (
          <div className="flex items-center gap-3 py-8 justify-center">
            <Brain className="w-5 h-5 text-blue-500 animate-pulse" />
            <p className="text-sm text-slate-500">AI is analyzing data...</p>
          </div>
        ) : error ? (
          <p className="text-sm text-red-500 py-4 text-center">
            Failed to load: {error.message}
          </p>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

// ── Expandable product forecast card ────────────────────────────
function ProductForecastCard({ item }) {
  const [open, setOpen] = useState(false);
  const { product, metrics, forecast } = item;

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition text-left"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
            <Package className="w-4 h-4 text-slate-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 text-sm">{product.name}</p>
            <p className="text-xs text-slate-400">{product.sku} · {product.quantity} units left</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge label={forecast.reorderRecommendation.urgency} color={urgencyColor(forecast.reorderRecommendation.urgency)} />
          <Badge label={forecast.riskLevel + " risk"} color={riskColor(forecast.riskLevel)} />
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-slate-100 px-4 py-4 space-y-4 bg-slate-50/50">
          {/* Demand Forecast */}
          <div>
            <p className="text-xs font-bold text-slate-600 uppercase mb-2">Demand Forecast</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Next 7 Days", value: forecast.demandForecast.next7Days },
                { label: "Next 30 Days", value: forecast.demandForecast.next30Days },
                { label: "Next 90 Days", value: forecast.demandForecast.next90Days },
              ].map((d) => (
                <div key={d.label} className="bg-white border border-slate-200 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-slate-900">{d.value}</p>
                  <p className="text-[10px] text-slate-500">{d.label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-2">
              <Badge label={"trend: " + forecast.demandForecast.trend} color={trendColor(forecast.demandForecast.trend)} />
              <Badge label={"confidence: " + forecast.demandForecast.confidence} color="blue" />
            </div>
          </div>

          {/* Reorder */}
          <div>
            <p className="text-xs font-bold text-slate-600 uppercase mb-2">Reorder Recommendation</p>
            <div className="bg-white border border-slate-200 rounded-lg p-3 space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Should Reorder</span>
                <span className="font-bold text-slate-900">{forecast.reorderRecommendation.shouldReorder ? "Yes" : "No"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recommended Qty</span>
                <span className="font-bold text-slate-900">{forecast.reorderRecommendation.recommendedQuantity} units</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Days Until Stockout</span>
                <span className="font-bold text-slate-900">{forecast.reorderRecommendation.estimatedDaysUntilStockout ?? "N/A"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Reorder Point</span>
                <span className="font-bold text-slate-900">{forecast.reorderRecommendation.reorderPoint} units</span>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div>
            <p className="text-xs font-bold text-slate-600 uppercase mb-2">AI Insights</p>
            <ul className="space-y-1.5">
              {forecast.insights.map((insight, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                  {insight}
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendation */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3">
            <p className="text-xs text-blue-800">{forecast.recommendation}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────
export default function AIForecastPage() {
  const health = useQuery({ queryKey: ["ai-health"], queryFn: fetchInventoryHealth });
  const lowStock = useQuery({ queryKey: ["ai-lowstock"], queryFn: fetchLowStockForecast });
  const sales = useQuery({ queryKey: ["ai-sales"], queryFn: fetchSalesForecast });

  const healthData = health.data?.data;
  const lowStockData = lowStock.data?.data || [];
  const salesData = sales.data?.data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-600" />
          AI Forecasting & Insights
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Powered by Claude AI — demand forecasting, inventory health, and sales trend analysis
        </p>
      </div>

      {/* Inventory Health */}
      <Section
        title="Inventory Health Analysis"
        icon={ShieldAlert}
        loading={health.isLoading}
        error={health.error}
        onRefetch={() => health.refetch()}
      >
        {healthData && (
          <div className="space-y-5">
            {/* Score */}
            <div className="flex items-center gap-5">
              <div className="w-20 h-20 rounded-full border-4 border-slate-200 flex flex-col items-center justify-center shrink-0">
                <span className="text-2xl font-black text-slate-900">{healthData.analysis.healthScore}</span>
                <span className="text-[9px] text-slate-400 uppercase font-bold">/ 100</span>
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-800 text-lg capitalize">{healthData.analysis.healthStatus}</p>
                  <Badge label={healthData.analysis.healthStatus} color={healthColor(healthData.analysis.healthStatus)} />
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div><p className="text-slate-500">Total Products</p><p className="font-bold">{healthData.overview.totalProducts}</p></div>
                  <div><p className="text-slate-500">Out of Stock</p><p className="font-bold text-red-600">{healthData.overview.outOfStock}</p></div>
                  <div><p className="text-slate-500">Low Stock</p><p className="font-bold text-amber-600">{healthData.overview.lowStockCount}</p></div>
                </div>
              </div>
            </div>

            {/* Values */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Retail Value", value: formatCurrency(healthData.overview.totalRetailValue) },
                { label: "Cost Value", value: formatCurrency(healthData.overview.totalCostValue) },
                { label: "Potential Profit", value: formatCurrency(healthData.overview.potentialProfit) },
              ].map((d) => (
                <div key={d.label} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                  <p className="text-sm font-bold text-slate-900">{d.value}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{d.label}</p>
                </div>
              ))}
            </div>

            {/* Findings & Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase mb-2">Key Findings</p>
                <ul className="space-y-1.5">
                  {healthData.analysis.keyFindings.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <BarChart2 className="w-3.5 h-3.5 text-blue-500 mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-600 uppercase mb-2">Immediate Actions</p>
                <ul className="space-y-1.5">
                  {healthData.analysis.immediateActions.map((a, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                      <Zap className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {healthData.analysis.summary}
            </div>
          </div>
        )}
      </Section>

      {/* Sales Forecast */}
      <Section
        title="Sales Trend Forecast"
        icon={TrendingUp}
        loading={sales.isLoading}
        error={sales.error}
        onRefetch={() => sales.refetch()}
      >
        {salesData && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Next 7d Revenue", value: formatCurrency(salesData.forecast.next7Days.revenue) },
                { label: "Next 7d Orders", value: salesData.forecast.next7Days.orders },
                { label: "Next 30d Revenue", value: formatCurrency(salesData.forecast.next30Days.revenue) },
                { label: "Next 30d Orders", value: salesData.forecast.next30Days.orders },
              ].map((d) => (
                <div key={d.label} className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-center">
                  <p className="text-sm font-bold text-slate-900">{d.value}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{d.label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Badge label={"trend: " + salesData.forecast.trend} color={trendColor(salesData.forecast.trend)} />
              <Badge label={"confidence: " + salesData.forecast.confidence} color="blue" />
            </div>
            <ul className="space-y-1.5">
              {salesData.insights.map((ins, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                  {ins}
                </li>
              ))}
            </ul>
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-800">
              {salesData.recommendation}
            </div>
          </div>
        )}
      </Section>

      {/* Low Stock Forecasts */}
      <Section
        title={`Low Stock Product Forecasts (${lowStockData.length})`}
        icon={AlertTriangle}
        loading={lowStock.isLoading}
        error={lowStock.error}
        onRefetch={() => lowStock.refetch()}
      >
        {lowStockData.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-6">No low stock products found.</p>
        ) : (
          <div className="space-y-3">
            {lowStockData.map((item) => (
              <ProductForecastCard key={item.product._id} item={item} />
            ))}
          </div>
        )}
      </Section>
    </div>
  );
}