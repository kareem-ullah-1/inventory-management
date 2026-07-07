import Product from "../models/Product.js";
import Sales from "../models/Sale.js";
import Purchase from "../models/Purchase.js";
import fetch from "node-fetch";

const getInventoryContext = async () => {
  const [products, recentSales, lowStock, topSelling] = await Promise.all([
    Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalProducts: { $sum: 1 },
          totalUnits: { $sum: "$quantity" },
          totalValue: { $sum: { $multiply: ["$price", "$quantity"] } },
          outOfStock: { $sum: { $cond: [{ $eq: ["$quantity", 0] }, 1, 0] } },
        },
      },
    ]),
    Sales.aggregate([
      { $match: { status: { $ne: "cancelled" }, createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: null, totalRevenue: { $sum: "$total" }, totalOrders: { $sum: 1 } } },
    ]),
    Product.find({ isActive: true, $expr: { $lte: ["$quantity", "$lowStockThreshold"] } })
      .select("name sku quantity lowStockThreshold")
      .limit(5)
      .lean(),
    Sales.aggregate([
      { $match: { status: { $ne: "cancelled" }, createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $unwind: "$items" },
      { $group: { _id: "$items.product", name: { $first: "$items.name" }, totalSold: { $sum: "$items.quantity" } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]),
  ]);

  return {
    inventory: products[0] || { totalProducts: 0, totalUnits: 0, totalValue: 0, outOfStock: 0 },
    sales: recentSales[0] || { totalRevenue: 0, totalOrders: 0 },
    lowStock,
    topSelling,
  };
};

const callOpenRouter = async (messages, systemPrompt) => {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "StockFlow IMS",
    },
    body: JSON.stringify({
        model: "poolside/laguna-xs-2.1:free",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
    }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || "OpenRouter error");
  return data.choices[0].message.content;
};

export const chat = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: "Messages array required" });
    }

    const context = await getInventoryContext();

    const systemPrompt = `You are an intelligent AI assistant for StockFlow, an inventory management system. You help warehouse managers and staff with inventory questions, sales analysis, and business advice.

CURRENT INVENTORY DATA:
- Total Active Products: ${context.inventory.totalProducts}
- Total Stock Units: ${context.inventory.totalUnits}
- Total Inventory Value: $${(context.inventory.totalValue || 0).toFixed(2)}
- Out of Stock Products: ${context.inventory.outOfStock}

SALES (last 30 days):
- Total Revenue: $${(context.sales.totalRevenue || 0).toFixed(2)}
- Total Orders: ${context.sales.totalOrders}

LOW STOCK ALERTS:
${context.lowStock.length > 0 ? context.lowStock.map(p => `- ${p.name} (${p.sku}): ${p.quantity} units left`).join("\n") : "- No low stock alerts"}

TOP SELLING PRODUCTS (last 30 days):
${context.topSelling.length > 0 ? context.topSelling.map(p => `- ${p.name}: ${p.totalSold} units sold`).join("\n") : "- No sales data"}

Be concise, professional, and helpful. Answer questions about inventory and business operations.`;

    const reply = await callOpenRouter(messages, systemPrompt);

    res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error("AI Chat Error:", error.message);
    res.status(500).json({ success: false, message: "AI chat failed", error: error.message });
  }
};