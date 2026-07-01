import Product from "../models/Product.js";
import StockLog from "../models/StockLog.js";
import Category from "../models/Category.js";
import User from "../models/User.js";
import Sales from "../models/Sale.js";

const getDashboardStats = async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const [
      totalProducts,
      activeProducts,
      totalCategories,
      totalUsers,
      lowStockProducts,
      stockValueAgg,
      recentStockLogs,
      salesThisMonth,
      totalSalesAgg,
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ isActive: true }),
      Category.countDocuments(),
      User.countDocuments(),

      Product.find({
        $expr: { $lte: ["$quantity", "$lowStockThreshold"] },
      })
        .select("name sku quantity lowStockThreshold")
        .limit(10),

      Product.aggregate([
        {
          $group: {
            _id: null,
            totalValue: {
              $sum: { $multiply: [{ $ifNull: ["$price", 0] }, { $ifNull: ["$quantity", 0] }] },
            },
            totalCostValue: {
              $sum: { $multiply: [{ $ifNull: ["$costPrice", 0] }, { $ifNull: ["$quantity", 0] }] },
            },
            totalUnits: { $sum: "$quantity" },
          },
        },
      ]),

      StockLog.find()
        .populate("product", "name sku")
        .populate("createdBy", "name")
        .sort({ createdAt: -1 })
        .limit(10),

      // Sales this month
      Sales.aggregate([
        {
          $match: {
            status: { $ne: "cancelled" },
            createdAt: { $gte: startOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$total" },
            totalOrders: { $sum: 1 },
          },
        },
      ]),

      // All time sales
      Sales.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$total" },
            totalOrders: { $sum: 1 },
          },
        },
      ]),
    ]);

    const stockSummary = stockValueAgg[0] || {
      totalValue: 0,
      totalCostValue: 0,
      totalUnits: 0,
    };

    const monthlySales = salesThisMonth[0] || { totalRevenue: 0, totalOrders: 0 };
    const allTimeSales = totalSalesAgg[0] || { totalRevenue: 0, totalOrders: 0 };

    res.status(200).json({
      success: true,
      stats: {
        totalProducts,
        activeProducts,
        inactiveProducts: totalProducts - activeProducts,
        totalCategories,
        totalUsers,
        lowStockCount: lowStockProducts.length,
        totalStockUnits: stockSummary.totalUnits,
        totalStockValue: stockSummary.totalValue,
        totalCostValue: stockSummary.totalCostValue,
        // Sales stats
        totalRevenue: allTimeSales.totalRevenue,
        totalSalesOrders: allTimeSales.totalOrders,
        monthlyRevenue: monthlySales.totalRevenue,
        monthlySalesOrders: monthlySales.totalOrders,
      },
      lowStockProducts,
      recentStockLogs,
    });
  } catch (error) {
    console.error("DASHBOARD ERROR:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard stats",
      error: error.message,
    });
  }
};

const getStockMovementSummary = async (req, res) => {
  try {
    const { days = 7 } = req.query;

    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - Number(days));

    const movement = await StockLog.aggregate([
      { $match: { createdAt: { $gte: fromDate } } },
      {
        $group: {
          _id: {
            type: "$type",
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          },
          totalQuantity: { $sum: "$quantity" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 } },
    ]);

    res.status(200).json({
      success: true,
      days: Number(days),
      movement,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch stock movement summary",
      error: error.message,
    });
  }
};

const getTopCategories = async (req, res) => {
  try {
    const categories = await Product.aggregate([
      {
        $group: {
          _id: "$category",
          productCount: { $sum: 1 },
          totalUnits: { $sum: "$quantity" },
          totalValue: {
            $sum: { $multiply: [{ $ifNull: ["$price", 0] }, { $ifNull: ["$quantity", 0] }] },
          },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryInfo",
        },
      },
      {
        $unwind: {
          path: "$categoryInfo",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          productCount: 1,
          totalUnits: 1,
          totalValue: 1,
          categoryName: "$categoryInfo.name",
        },
      },
      { $sort: { totalValue: -1 } },
      { $limit: 10 },
    ]);

    res.status(200).json({
      success: true,
      categories,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch top categories",
      error: error.message,
    });
  }
};

export { getDashboardStats, getStockMovementSummary, getTopCategories };