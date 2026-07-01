import Product from "../models/Product.js";
import Sales from "../models/Sale.js";
import Purchase from "../models/Purchase.js";
import Customer from "../models/Customer.js";

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

export const chat = async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ success: false, message: "Messages array required" });
    }

    const context = await getInventoryContext();

    const systemPrompt = `You are an intelligent AI assistant for StockFlow, an inventory management system. You help warehouse managers and staff with inventory questions, sales analysis, and business advice.

CURRENT INVENTORY DATA (as of now):
- Total Active Products: ${context.inventory.totalProducts}
- Total Stock Units: ${context.inventory.totalUnits}
- Total Inventory Value: $${context.inventory.totalValue.toFixed(2)}
- Out of Stock Products: ${context.inventory.outOfStock}

SALES (last 30 days):
- Total Revenue: $${context.inventory.totalRevenue || context.sales.totalRevenue}
- Total Orders: ${context.sales.totalOrders}

LOW STOCK ALERTS:
${context.lowStock.length > 0 ? context.lowStock.map(p => `- ${p.name} (${p.sku}): ${p.quantity} units left (threshold: ${p.lowStockThreshold})`).join("\n") : "- No low stock alerts"}

TOP SELLING PRODUCTS (last 30 days):
${context.topSelling.length > 0 ? context.topSelling.map(p => `- ${p.name}: ${p.totalSold} units sold`).join("\n") : "- No sales data available"}

INSTRUCTIONS:
- Answer questions about inventory, stock levels, sales, and business operations
- Provide actionable advice when asked
- Be concise and professional
- If asked about specific products not in the data, say you can only see summary data
- Format numbers clearly with currency symbols and units`;

    const Anthropic = (await import("@anthropic-ai/sdk")).default;
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1000,
      system: systemPrompt,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
    });

    const reply = response.content
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    res.status(200).json({ success: true, reply });
  } catch (error) {
    console.error("AI Chat Error:", error.message);
    res.status(500).json({ success: false, message: "AI chat failed", error: error.message });
  }
};