import Sale from "../models/Sale.js";
import Purchase from "../models/Purchase.js";
import Product from "../models/Product.js";
import StockLog from "../models/StockLog.js";
import Customer from "../models/Customer.js";

const getDateRange = (period) => {
  const now = new Date();
  const start = new Date();

  switch (period) {
    case "today":
      start.setHours(0, 0, 0, 0);
      break;
    case "week":
      start.setDate(now.getDate() - 7);
      break;
    case "month":
      start.setMonth(now.getMonth() - 1);
      break;
    case "quarter":
      start.setMonth(now.getMonth() - 3);
      break;
    case "year":
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setMonth(now.getMonth() - 1);
  }

  return { start, end: now };
};

const getSalesReport = async (req, res) => {
  try {
    const { period = "month", startDate, endDate } = req.query;

    const range = startDate && endDate
      ? { start: new Date(startDate), end: new Date(new Date(endDate).setHours(23, 59, 59, 999)) }
      : getDateRange(period);

    const matchQuery = {
      status: { $ne: "cancelled" },
      createdAt: { $gte: range.start, $lte: range.end },
    };

    const [summary, salesByDay, topProducts, byPaymentMethod, byStatus] = await Promise.all([
      Sale.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalRevenue:   { $sum: "$total" },
            totalOrders:    { $sum: 1 },
            totalItemsSold: { $sum: { $sum: "$items.quantity" } },
            avgOrderValue:  { $avg: "$total" },
            totalDiscount:  { $sum: "$discount" },
            totalTax:       { $sum: "$taxAmount" },
          },
        },
      ]),

      Sale.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id:     { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$total" },
            orders:  { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),

      Sale.aggregate([
        { $match: matchQuery },
        { $unwind: "$items" },
        {
          $group: {
            _id:           "$items.product",
            name:          { $first: "$items.name" },
            sku:           { $first: "$items.sku" },
            totalQuantity: { $sum: "$items.quantity" },
            totalRevenue:  { $sum: "$items.total" },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 10 },
      ]),

      Sale.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id:     "$paymentMethod",
            count:   { $sum: 1 },
            revenue: { $sum: "$total" },
          },
        },
      ]),

      Sale.aggregate([
        { $match: { createdAt: { $gte: range.start, $lte: range.end } } },
        {
          $group: {
            _id:   "$status",
            count: { $sum: 1 },
            total: { $sum: "$total" },
          },
        },
      ]),
    ]);

    res.status(200).json({
      success: true,
      period,
      dateRange: { start: range.start, end: range.end },
      summary: summary[0] || {
        totalRevenue: 0,
        totalOrders: 0,
        totalItemsSold: 0,
        avgOrderValue: 0,
        totalDiscount: 0,
        totalTax: 0,
      },
      salesByDay,
      topProducts,
      byPaymentMethod,
      byStatus,
    });
  } catch (error) {
    console.error("SALES REPORT ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to generate sales report",
      error: error.message,
    });
  }
};

const getStockReport = async (req, res) => {
  try {
    const { period = "month" } = req.query;
    const range = getDateRange(period);

    const [inventorySummary, lowStockProducts, outOfStockProducts, movementByType, movementByDay, topMovingProducts] =
      await Promise.all([
        Product.aggregate([
          { $match: { isActive: true } },
          {
            $group: {
              _id:              null,
              totalProducts:    { $sum: 1 },
              totalUnits:       { $sum: "$quantity" },
              totalRetailValue: { $sum: { $multiply: ["$price", "$quantity"] } },
              totalCostValue:   { $sum: { $multiply: ["$costPrice", "$quantity"] } },
            },
          },
        ]),

        Product.find({
          isActive: true,
          $expr: { $lte: ["$quantity", "$lowStockThreshold"] },
          quantity: { $gt: 0 },
        })
          .select("name sku quantity lowStockThreshold category")
          .sort({ quantity: 1 })
          .limit(20),

        Product.find({ isActive: true, quantity: 0 })
          .select("name sku category supplier")
          .populate("supplier", "name")
          .limit(20),

        StockLog.aggregate([
          { $match: { createdAt: { $gte: range.start, $lte: range.end } } },
          {
            $group: {
              _id:           "$type",
              totalQuantity: { $sum: "$quantity" },
              count:         { $sum: 1 },
            },
          },
        ]),

        StockLog.aggregate([
          { $match: { createdAt: { $gte: range.start, $lte: range.end } } },
          {
            $group: {
              _id:      { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              stockIn:  { $sum: { $cond: [{ $eq: ["$type", "in"] }, "$quantity", 0] } },
              stockOut: { $sum: { $cond: [{ $eq: ["$type", "out"] }, "$quantity", 0] } },
            },
          },
          { $sort: { _id: 1 } },
        ]),

        StockLog.aggregate([
          { $match: { createdAt: { $gte: range.start, $lte: range.end } } },
          {
            $group: {
              _id:           "$product",
              totalMovement: { $sum: "$quantity" },
              count:         { $sum: 1 },
            },
          },
          { $sort: { totalMovement: -1 } },
          { $limit: 10 },
          {
            $lookup: {
              from:         "products",
              localField:   "_id",
              foreignField: "_id",
              as:           "product",
            },
          },
          { $unwind: "$product" },
          {
            $project: {
              name:          "$product.name",
              sku:           "$product.sku",
              totalMovement: 1,
              count:         1,
            },
          },
        ]),
      ]);

    res.status(200).json({
      success: true,
      period,
      dateRange: { start: range.start, end: range.end },
      inventorySummary: inventorySummary[0] || {
        totalProducts: 0,
        totalUnits: 0,
        totalRetailValue: 0,
        totalCostValue: 0,
      },
      lowStockProducts,
      outOfStockProducts,
      movementByType,
      movementByDay,
      topMovingProducts,
    });
  } catch (error) {
    console.error("STOCK REPORT ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to generate stock report",
      error: error.message,
    });
  }
};

const getPurchaseReport = async (req, res) => {
  try {
    const { period = "month", startDate, endDate } = req.query;

    const range = startDate && endDate
      ? { start: new Date(startDate), end: new Date(new Date(endDate).setHours(23, 59, 59, 999)) }
      : getDateRange(period);

    const matchQuery = {
      status: { $ne: "cancelled" },
      createdAt: { $gte: range.start, $lte: range.end },
    };

    const [summary, bySupplier, byStatus, purchasesByDay] = await Promise.all([
      Purchase.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id:           null,
            totalSpent:    { $sum: "$total" },
            totalOrders:   { $sum: 1 },
            totalPaid:     { $sum: "$amountPaid" },
            totalDue:      { $sum: "$amountDue" },
            totalTax:      { $sum: "$taxAmount" },
            totalShipping: { $sum: "$shippingCost" },
          },
        },
      ]),

      Purchase.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id:        "$supplier",
            orderCount: { $sum: 1 },
            totalSpent: { $sum: "$total" },
          },
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from:         "suppliers",
            localField:   "_id",
            foreignField: "_id",
            as:           "supplier",
          },
        },
        { $unwind: "$supplier" },
        {
          $project: {
            name:       "$supplier.name",
            orderCount: 1,
            totalSpent: 1,
          },
        },
      ]),

      Purchase.aggregate([
        { $match: { createdAt: { $gte: range.start, $lte: range.end } } },
        {
          $group: {
            _id:   "$status",
            count: { $sum: 1 },
            total: { $sum: "$total" },
          },
        },
      ]),

      Purchase.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id:   { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            spent: { $sum: "$total" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      period,
      dateRange: { start: range.start, end: range.end },
      summary: summary[0] || {
        totalSpent: 0,
        totalOrders: 0,
        totalPaid: 0,
        totalDue: 0,
        totalTax: 0,
        totalShipping: 0,
      },
      bySupplier,
      byStatus,
      purchasesByDay,
    });
  } catch (error) {
    console.error("PURCHASE REPORT ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to generate purchase report",
      error: error.message,
    });
  }
};

const getProfitLossReport = async (req, res) => {
  try {
    const { period = "month", startDate, endDate } = req.query;

    const range = startDate && endDate
      ? { start: new Date(startDate), end: new Date(new Date(endDate).setHours(23, 59, 59, 999)) }
      : getDateRange(period);

    const matchQuery = {
      status: { $ne: "cancelled" },
      createdAt: { $gte: range.start, $lte: range.end },
    };

    const [salesData, purchaseData, profitByProduct, profitByDay] = await Promise.all([
      Sale.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id:           null,
            totalRevenue:  { $sum: "$total" },
            totalDiscount: { $sum: "$discount" },
            totalTax:      { $sum: "$taxAmount" },
          },
        },
      ]),

      Purchase.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id:           null,
            totalCost:     { $sum: "$total" },
            totalTax:      { $sum: "$taxAmount" },
            totalShipping: { $sum: "$shippingCost" },
          },
        },
      ]),

      Sale.aggregate([
        { $match: matchQuery },
        { $unwind: "$items" },
        {
          $lookup: {
            from:         "products",
            localField:   "items.product",
            foreignField: "_id",
            as:           "productData",
          },
        },
        { $unwind: { path: "$productData", preserveNullAndEmptyArrays: true } },
        {
          $group: {
            _id:           "$items.product",
            name:          { $first: "$items.name" },
            sku:           { $first: "$items.sku" },
            totalRevenue:  { $sum: "$items.total" },
            totalCost: {
              $sum: {
                $multiply: [
                  { $ifNull: ["$productData.costPrice", 0] },
                  "$items.quantity",
                ],
              },
            },
            totalQuantity: { $sum: "$items.quantity" },
          },
        },
        {
          $addFields: {
            profit: { $subtract: ["$totalRevenue", "$totalCost"] },
            margin: {
              $cond: [
                { $eq: ["$totalRevenue", 0] },
                0,
                {
                  $multiply: [
                    { $divide: [{ $subtract: ["$totalRevenue", "$totalCost"] }, "$totalRevenue"] },
                    100,
                  ],
                },
              ],
            },
          },
        },
        { $sort: { profit: -1 } },
        { $limit: 10 },
      ]),

      Sale.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id:     { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            revenue: { $sum: "$total" },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    const revenue     = salesData[0]?.totalRevenue || 0;
    const costs       = purchaseData[0]?.totalCost  || 0;
    const grossProfit = revenue - costs;
    const margin      = revenue > 0 ? ((grossProfit / revenue) * 100).toFixed(2) : 0;

    res.status(200).json({
      success: true,
      period,
      dateRange: { start: range.start, end: range.end },
      summary: {
        totalRevenue:  revenue,
        totalCost:     costs,
        grossProfit,
        profitMargin:  Number(margin),
        totalDiscount: salesData[0]?.totalDiscount   || 0,
        totalTax:      salesData[0]?.totalTax         || 0,
        shippingCost:  purchaseData[0]?.totalShipping || 0,
      },
      profitByProduct,
      profitByDay,
    });
  } catch (error) {
    console.error("PROFIT LOSS ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to generate profit & loss report",
      error: error.message,
    });
  }
};

const getCustomerReport = async (req, res) => {
  try {
    const { period = "month" } = req.query;
    const range = getDateRange(period);

    const matchQuery = {
      status: { $ne: "cancelled" },
      createdAt: { $gte: range.start, $lte: range.end },
    };

    const [summary, topCustomers, newCustomers] = await Promise.all([
      Sale.aggregate([
        { $match: { ...matchQuery, customer: { $exists: true } } },
        {
          $group: {
            _id:           "$customer",
            totalSpent:    { $sum: "$total" },
            orderCount:    { $sum: 1 },
            lastOrderDate: { $max: "$createdAt" },
          },
        },
        {
          $group: {
            _id:                  null,
            totalActiveCustomers: { $sum: 1 },
            totalCustomerRevenue: { $sum: "$totalSpent" },
            avgOrdersPerCustomer: { $avg: "$orderCount" },
            avgSpendPerCustomer:  { $avg: "$totalSpent" },
          },
        },
      ]),

      Sale.aggregate([
        { $match: { ...matchQuery, customer: { $exists: true } } },
        {
          $group: {
            _id:           "$customer",
            totalSpent:    { $sum: "$total" },
            orderCount:    { $sum: 1 },
            lastOrderDate: { $max: "$createdAt" },
          },
        },
        { $sort: { totalSpent: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from:         "customers",
            localField:   "_id",
            foreignField: "_id",
            as:           "customer",
          },
        },
        { $unwind: { path: "$customer", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            name:          { $ifNull: ["$customer.name", "Unknown"] },
            email:         "$customer.email",
            totalSpent:    1,
            orderCount:    1,
            lastOrderDate: 1,
          },
        },
      ]),

      Customer.countDocuments({
        createdAt: { $gte: range.start, $lte: range.end },
      }),
    ]);

    res.status(200).json({
      success: true,
      period,
      dateRange: { start: range.start, end: range.end },
      summary: {
        ...(summary[0] || {
          totalActiveCustomers: 0,
          totalCustomerRevenue: 0,
          avgOrdersPerCustomer: 0,
          avgSpendPerCustomer:  0,
        }),
        newCustomers,
      },
      topCustomers,
    });
  } catch (error) {
    console.error("CUSTOMER REPORT ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to generate customer report",
      error: error.message,
    });
  }
};

export {
  getSalesReport,
  getStockReport,
  getPurchaseReport,
  getProfitLossReport,
  getCustomerReport,
};