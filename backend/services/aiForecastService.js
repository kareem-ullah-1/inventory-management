import Anthropic from "@anthropic-ai/sdk";
import Sale from "../models/Sale.js";
import Purchase from "../models/Purchase.js";
import Product from "../models/Product.js";
import StockLog from "../models/StockLog.js";

console.log("ANTHROPIC KEY:", process.env.ANTHROPIC_API_KEY); // ← move here

const getClient = () => new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const getProductSalesHistory = async (productId, days = 90) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const salesHistory = await Sale.aggregate([
    {
      $match: {
        status: { $ne: "cancelled" },
        createdAt: { $gte: startDate },
        "items.product": productId,
      },
    },
    { $unwind: "$items" },
    { $match: { "items.product": productId } },
    {
      $group: {
        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        totalSold: { $sum: "$items.quantity" },
        revenue: { $sum: "$items.total" },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  return salesHistory;
};

const getStockMovementHistory = async (productId, days = 90) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await StockLog.find({
    product: productId,
    createdAt: { $gte: startDate },
  })
    .sort({ createdAt: 1 })
    .select("type quantity previousQuantity newQuantity reason createdAt");
};

const getLowStockProducts = async () => {
  return await Product.find({
    isActive: true,
    $expr: { $lte: ["$quantity", "$lowStockThreshold"] },
  })
    .populate("supplier", "name email phone")
    .select("name sku quantity lowStockThreshold category supplier price costPrice");
};

const getTopSellingProducts = async (days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return await Sale.aggregate([
    {
      $match: {
        status: { $ne: "cancelled" },
        createdAt: { $gte: startDate },
      },
    },
    { $unwind: "$items" },
    {
      $group: {
        _id: "$items.product",
        name: { $first: "$items.name" },
        sku: { $first: "$items.sku" },
        totalSold: { $sum: "$items.quantity" },
        totalRevenue: { $sum: "$items.total" },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: 20 },
  ]);
};

// ── Forecast demand for a single product ─────────────────────────
const forecastProductDemand = async (productId) => {
  const product = await Product.findById(productId)
    .populate("supplier", "name email phone")
    .populate("category", "name");

  if (!product) throw new Error("Product not found");

  const [salesHistory, stockMovement] = await Promise.all([
    getProductSalesHistory(productId, 90),
    getStockMovementHistory(productId, 90),
  ]);

  const totalSold = salesHistory.reduce((sum, d) => sum + d.totalSold, 0);
  const avgDailySales = salesHistory.length > 0 ? totalSold / 90 : 0;

  const prompt = `You are an AI inventory analyst for a business inventory management system.

Analyze the following product data and provide a demand forecast and reorder recommendation.

PRODUCT INFORMATION:
- Name: ${product.name}
- SKU: ${product.sku}
- Category: ${product.category?.name || product.category || "N/A"}
- Current Stock: ${product.quantity} ${product.unit}
- Low Stock Threshold: ${product.lowStockThreshold} ${product.unit}
- Selling Price: $${product.price}
- Cost Price: $${product.costPrice || "N/A"}
- Supplier: ${product.supplier?.name || "N/A"}

SALES HISTORY (last 90 days, by date):
${JSON.stringify(salesHistory, null, 2)}

STOCK MOVEMENT HISTORY (last 90 days):
${JSON.stringify(stockMovement.slice(-20), null, 2)}

CALCULATED METRICS:
- Total units sold (90 days): ${totalSold}
- Average daily sales: ${avgDailySales.toFixed(2)} units/day
- Days of stock remaining: ${avgDailySales > 0 ? (product.quantity / avgDailySales).toFixed(0) : "N/A"} days

Provide your analysis in the following JSON format only, no other text:
{
  "demandForecast": {
    "next7Days": <number>,
    "next30Days": <number>,
    "next90Days": <number>,
    "trend": "increasing" | "decreasing" | "stable",
    "confidence": "high" | "medium" | "low"
  },
  "reorderRecommendation": {
    "shouldReorder": <boolean>,
    "urgency": "critical" | "soon" | "normal" | "not_needed",
    "recommendedQuantity": <number>,
    "estimatedDaysUntilStockout": <number | null>,
    "reorderPoint": <number>
  },
  "insights": [
    "<insight string>",
    "<insight string>",
    "<insight string>"
  ],
  "riskLevel": "high" | "medium" | "low",
  "recommendation": "<one paragraph recommendation>"
}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  const clean = text.replace(/```json|```/g, "").trim();
  const forecast = JSON.parse(clean);

  return {
    product: {
      _id: product._id,
      name: product.name,
      sku: product.sku,
      quantity: product.quantity,
      lowStockThreshold: product.lowStockThreshold,
      supplier: product.supplier,
    },
    metrics: {
      totalSold,
      avgDailySales: Number(avgDailySales.toFixed(2)),
      salesDataPoints: salesHistory.length,
    },
    forecast,
  };
};

// ── Forecast for all low stock products ─────────────────────────
const forecastLowStockProducts = async () => {
  const lowStockProducts = await getLowStockProducts();

  const forecasts = await Promise.allSettled(
    lowStockProducts.map((p) => forecastProductDemand(p._id))
  );

  return forecasts
    .filter((r) => r.status === "fulfilled")
    .map((r) => r.value)
    .sort((a, b) => {
      const urgencyOrder = { critical: 0, soon: 1, normal: 2, not_needed: 3 };
      return (
        urgencyOrder[a.forecast.reorderRecommendation.urgency] -
        urgencyOrder[b.forecast.reorderRecommendation.urgency]
      );
    });
};

// ── Overall inventory health analysis ────────────────────────────
const analyzeInventoryHealth = async () => {
  const [allProducts, topSelling, lowStock] = await Promise.all([
    Product.find({ isActive: true }).select(
      "name sku quantity lowStockThreshold category price costPrice"
    ),
    getTopSellingProducts(30),
    getLowStockProducts(),
  ]);

  const totalProducts    = allProducts.length;
  const outOfStock       = allProducts.filter((p) => p.quantity === 0).length;
  const lowStockCount    = lowStock.length;
  const totalRetailValue = allProducts.reduce((s, p) => s + p.price * p.quantity, 0);
  const totalCostValue   = allProducts.reduce((s, p) => s + (p.costPrice || 0) * p.quantity, 0);

  const prompt = `You are an AI inventory analyst. Analyze the following inventory data and provide actionable insights.

INVENTORY OVERVIEW:
- Total Active Products: ${totalProducts}
- Out of Stock: ${outOfStock}
- Low Stock (at or below threshold): ${lowStockCount}
- Total Retail Value: $${totalRetailValue.toFixed(2)}
- Total Cost Value: $${totalCostValue.toFixed(2)}
- Potential Profit: $${(totalRetailValue - totalCostValue).toFixed(2)}

TOP SELLING PRODUCTS (last 30 days):
${JSON.stringify(topSelling, null, 2)}

LOW STOCK PRODUCTS:
${JSON.stringify(
  lowStock.map((p) => ({
    name: p.name,
    sku: p.sku,
    quantity: p.quantity,
    threshold: p.lowStockThreshold,
    category: p.category,
  })),
  null,
  2
)}

Provide your analysis in the following JSON format only, no other text:
{
  "healthScore": <number 0-100>,
  "healthStatus": "excellent" | "good" | "fair" | "poor" | "critical",
  "keyFindings": [
    "<finding>",
    "<finding>",
    "<finding>"
  ],
  "immediateActions": [
    "<action>",
    "<action>"
  ],
  "opportunities": [
    "<opportunity>",
    "<opportunity>"
  ],
  "summary": "<two paragraph executive summary>"
}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1000,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  const clean = text.replace(/```json|```/g, "").trim();
  const analysis = JSON.parse(clean);

  return {
    overview: {
      totalProducts,
      outOfStock,
      lowStockCount,
      totalRetailValue: Number(totalRetailValue.toFixed(2)),
      totalCostValue:   Number(totalCostValue.toFixed(2)),
      potentialProfit:  Number((totalRetailValue - totalCostValue).toFixed(2)),
    },
    topSelling,
    lowStock: lowStock.map((p) => ({
      _id:              p._id,
      name:             p.name,
      sku:              p.sku,
      quantity:         p.quantity,
      lowStockThreshold:p.lowStockThreshold,
      category:         p.category,
      supplier:         p.supplier,
    })),
    analysis,
  };
};

// ── Sales trend forecast ─────────────────────────────────────────
const forecastSalesTrend = async (days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 90);

  const salesByDay = await Sale.aggregate([
    {
      $match: {
        status: { $ne: "cancelled" },
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id:     { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
        revenue: { $sum: "$total" },
        orders:  { $sum: 1 },
        items:   { $sum: { $sum: "$items.quantity" } },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  const totalRevenue = salesByDay.reduce((s, d) => s + d.revenue, 0);
  const avgDaily     = salesByDay.length > 0 ? totalRevenue / 90 : 0;

  const prompt = `You are an AI sales analyst. Based on the sales data below, forecast the next ${days} days.

SALES HISTORY (last 90 days):
${JSON.stringify(salesByDay, null, 2)}

METRICS:
- Total revenue (90 days): $${totalRevenue.toFixed(2)}
- Average daily revenue: $${avgDaily.toFixed(2)}
- Total data points: ${salesByDay.length} days

Respond with JSON only, no other text:
{
  "forecast": {
    "next7Days":  { "revenue": <number>, "orders": <number> },
    "next30Days": { "revenue": <number>, "orders": <number> },
    "trend":      "growing" | "declining" | "stable" | "volatile",
    "confidence": "high" | "medium" | "low"
  },
  "insights": ["<insight>", "<insight>", "<insight>"],
  "recommendation": "<paragraph>"
}`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 800,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  const clean = text.replace(/```json|```/g, "").trim();
  const result = JSON.parse(clean);

  return {
    historicalData: {
      salesByDay,
      totalRevenue: Number(totalRevenue.toFixed(2)),
      avgDailyRevenue: Number(avgDaily.toFixed(2)),
      dataPoints: salesByDay.length,
    },
    ...result,
  };
};

export {
  forecastProductDemand,
  forecastLowStockProducts,
  analyzeInventoryHealth,
  forecastSalesTrend,
};