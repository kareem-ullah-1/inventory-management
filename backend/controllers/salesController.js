import mongoose from "mongoose";
import Sales from "../models/Sale.js";
import Product from "../models/Product.js";
import StockLog from "../models/StockLog.js";
import Notification from "../models/Notification.js";

const generateInvoiceNumber = async () => {
  const lastSale = await Sales.findOne()
    .sort({ createdAt: -1 })
    .select("invoiceNumber");

  if (!lastSale || !lastSale.invoiceNumber) return "INV-0001";

  const parts = lastSale.invoiceNumber.split("-");
  const lastNum = parseInt(parts[1], 10);
  if (isNaN(lastNum)) return "INV-0001";

  let nextNum = lastNum + 1;
  let invoiceNumber = `INV-${String(nextNum).padStart(4, "0")}`;

  while (await Sales.findOne({ invoiceNumber })) {
    nextNum++;
    invoiceNumber = `INV-${String(nextNum).padStart(4, "0")}`;
  }

  return invoiceNumber;
};

const createLowStockNotification = async (product, userId) => {
  if (product.quantity <= product.lowStockThreshold) {
    await Notification.create({
      type: product.quantity === 0 ? "out_of_stock" : "low_stock",
      title: product.quantity === 0 ? "Out of Stock Alert" : "Low Stock Alert",
      message: `${product.name} is now at ${product.quantity} units`,
      product: product._id,
      user: userId,
    });
  }
};

const createSales = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      items,
      customer,
      customerName,
      paymentMethod,
      paymentStatus,
      amountPaid,
      taxRate,
      discount,
      note,
    } = req.body;

    if (!items || items.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Sale must have at least one item",
      });
    }

    const saleItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product).session(session);

      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }

      if (!product.isActive) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Product is inactive: ${product.name}`,
        });
      }

      if (product.quantity < item.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.quantity}`,
        });
      }

      const itemDiscount = item.discount || 0;
      const unitPrice = item.unitPrice || product.price;
      const itemTotal = unitPrice * item.quantity * (1 - itemDiscount / 100);

      saleItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unitPrice,
        discount: itemDiscount,
        total: itemTotal,
      });

      subtotal += itemTotal;

      const previousQuantity = product.quantity;
      const newQuantity = previousQuantity - item.quantity;

      product.quantity = newQuantity;
      await product.save({ session });

      await StockLog.create(
        [
          {
            product: product._id,
            type: "out",
            quantity: item.quantity,
            previousQuantity,
            newQuantity,
            reason: "sale",
            note: `Sale invoice`,
            createdBy: req.user.id,
          },
        ],
        { session }
      );
    }

    const discountAmount = parseFloat(discount) || 0;
    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const taxAmount = (discountedSubtotal * (taxRate || 0)) / 100;
    const total = discountedSubtotal + taxAmount;
    const paid = amountPaid !== undefined ? Number(amountPaid) : total;
    const amountDue = Math.max(0, total - paid);

    const invoiceNumber = await generateInvoiceNumber();

    const [sale] = await Sales.create(
      [
        {
          invoiceNumber,
          customer: customer || undefined,
          customerName: customerName || "Walk-in Customer",
          items: saleItems,
          subtotal,
          discount: discountAmount,
          taxRate: taxRate || 0,
          taxAmount,
          total,
          paymentMethod: paymentMethod ? paymentMethod.toLowerCase() : "cash",
          paymentStatus: paymentStatus || (amountDue > 0 ? "partial" : "paid"),
          amountPaid: paid,
          amountDue,
          status: "completed",
          note,
          soldBy: req.user.id,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    // Run after transaction is fully closed
    for (const item of saleItems) {
      const updatedProduct = await Product.findById(item.product);
      if (updatedProduct) {
        await createLowStockNotification(updatedProduct, req.user.id);
      }
    }

    const populatedSale = await Sales.findById(sale._id)
      .populate("customer", "name email phone")
      .populate("soldBy", "name email")
      .populate("items.product", "name sku price costPrice");

    return res.status(201).json({
      success: true,
      sale: populatedSale,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    console.error("CREATE SALE ERROR:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to create sale",
      error: error.message,
    });
  }
};

const getSales = async (req, res) => {
  try {
    const {
      search,
      status,
      paymentStatus,
      paymentMethod,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (search) {
      query.$or = [
        { invoiceNumber: { $regex: search, $options: "i" } },
        { customerName: { $regex: search, $options: "i" } },
      ];
    }

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (paymentMethod) query.paymentMethod = paymentMethod;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [sales, total] = await Promise.all([
      Sales.find(query)
        .populate("customer", "name email phone")
        .populate("soldBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Sales.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: sales.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      sales,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch sales",
      error: error.message,
    });
  }
};

const getSalesById = async (req, res) => {
  try {
    const sale = await Sales.findById(req.params.id)
      .populate("customer", "name email phone address")
      .populate("soldBy", "name email")
      .populate("items.product", "name sku price costPrice image");

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    res.status(200).json({
      success: true,
      sale,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch sale",
      error: error.message,
    });
  }
};

const updateSalesStatus = async (req, res) => {
  try {
    const { status, paymentStatus, amountPaid, note } = req.body;

    const sale = await Sales.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    if (status) sale.status = status;
    if (paymentStatus) sale.paymentStatus = paymentStatus;
    if (amountPaid !== undefined) {
      sale.amountPaid = Number(amountPaid);
      sale.amountDue = Math.max(0, sale.total - sale.amountPaid);
    }
    if (note) sale.note = note;

    await sale.save();

    res.status(200).json({
      success: true,
      sale,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update sale",
      error: error.message,
    });
  }
};

const cancelSales = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const sale = await Sales.findById(req.params.id).session(session);

    if (!sale) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    if (sale.status === "cancelled") {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: "Sale is already cancelled",
      });
    }

    for (const item of sale.items) {
      const product = await Product.findById(item.product).session(session);
      if (product) {
        const previousQuantity = product.quantity;
        const newQuantity = previousQuantity + item.quantity;
        product.quantity = newQuantity;
        await product.save({ session });

        await StockLog.create(
          [
            {
              product: product._id,
              type: "in",
              quantity: item.quantity,
              previousQuantity,
              newQuantity,
              reason: "return",
              note: `Sale cancelled: ${sale.invoiceNumber}`,
              createdBy: req.user.id,
            },
          ],
          { session }
        );
      }
    }

    sale.status = "cancelled";
    sale.paymentStatus = "cancelled";
    await sale.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(200).json({
      success: true,
      message: "Sale cancelled and stock restored",
      sale,
    });
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    res.status(500).json({
      success: false,
      message: "Failed to cancel sale",
      error: error.message,
    });
  }
};

const getSalesStats = async (req, res) => {
  try {
    const { period = "month" } = req.query;

    const now = new Date();
    let startDate = new Date();

    if (period === "today") startDate.setHours(0, 0, 0, 0);
    else if (period === "week") startDate.setDate(now.getDate() - 7);
    else if (period === "month") startDate.setMonth(now.getMonth() - 1);
    else if (period === "year") startDate.setFullYear(now.getFullYear() - 1);

    const matchQuery = {
      status: { $ne: "cancelled" },
      createdAt: { $gte: startDate },
    };

    const [stats, topProducts, salesByDay] = await Promise.all([
      Sales.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$total" },
            totalSales: { $sum: 1 },
            totalItemsSold: { $sum: { $sum: "$items.quantity" } },
            avgOrderValue: { $avg: "$total" },
          },
        },
      ]),

      Sales.aggregate([
        { $match: matchQuery },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.product",
            name: { $first: "$items.name" },
            sku: { $first: "$items.sku" },
            totalQuantity: { $sum: "$items.quantity" },
            totalRevenue: { $sum: "$items.total" },
          },
        },
        { $sort: { totalQuantity: -1 } },
        { $limit: 5 },
      ]),

      Sales.aggregate([
        { $match: matchQuery },
        {
          $group: {
            _id: {
              $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
            },
            revenue: { $sum: "$total" },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      period,
      stats: stats[0] || {
        totalRevenue: 0,
        totalSales: 0,
        totalItemsSold: 0,
        avgOrderValue: 0,
      },
      topProducts,
      salesByDay,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch sales stats",
      error: error.message,
    });
  }
};


const updateSaleStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = ["completed", "pending", "cancelled", "refunded"];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status value",
      });
    }

    const sale = await Sales.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: "Sale not found",
      });
    }

    res.status(200).json({
      success: true,
      sale,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Failed to update sale status",
      error: error.message,
    });
  }
};



export {
  createSales,
  getSales,
  getSalesById,
  updateSalesStatus,
  cancelSales,
  getSalesStats,
  updateSaleStatus,
};