import mongoose from "mongoose";
import Purchase from "../models/Purchase.js";
import Product from "../models/Product.js";
import StockLog from "../models/StockLog.js";

const generatePurchaseNumber = async () => {
  const last = await Purchase.findOne().sort({ createdAt: -1 }).select("purchaseNumber");
  if (!last || !last.purchaseNumber) return "PO-0001";
  
  const parts = last.purchaseNumber.split("-");
  const lastNum = parseInt(parts[1], 10);
  if (isNaN(lastNum)) return "PO-0001";

  let nextNum = lastNum + 1;
  let purchaseNumber = `PO-${String(nextNum).padStart(4, "0")}`;

  while (await Purchase.findOne({ purchaseNumber })) {
    nextNum++;
    purchaseNumber = `PO-${String(nextNum).padStart(4, "0")}`;
  }

  return purchaseNumber;
};

const createPurchase = async (req, res) => {
  try {
    const {
      supplier,
      items,
      taxRate,
      shippingCost,
      paymentMethod,
      paymentStatus,
      amountPaid,
      expectedDeliveryDate,
      note,
    } = req.body;

    if (!supplier) {
      return res.status(400).json({
        success: false,
        message: "Supplier is required",
      });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Purchase must have at least one item",
      });
    }

    const purchaseItems = [];
    let subtotal = 0;

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product not found: ${item.product}`,
        });
      }

      const unitCost = item.unitCost || product.costPrice || product.price;
      const itemTotal = unitCost * item.quantity;

      purchaseItems.push({
        product: product._id,
        name: product.name,
        sku: product.sku,
        quantity: item.quantity,
        unitCost,
        total: itemTotal,
        receivedQuantity: 0,
      });

      subtotal += itemTotal;
    }

    const tax = (subtotal * (taxRate || 0)) / 100;
    const shipping = shippingCost || 0;
    const total = subtotal + tax + shipping;
    const paid = amountPaid !== undefined ? Number(amountPaid) : 0;
    const amountDue = Math.max(0, total - paid);

    const purchaseNumber = await generatePurchaseNumber();

    const purchase = await Purchase.create({
      purchaseNumber,
      supplier,
      items: purchaseItems,
      subtotal,
      taxRate: taxRate || 0,
      taxAmount: tax,
      shippingCost: shipping,
      total,
      status: "pending",
      paymentMethod: paymentMethod || "bank_transfer",
      paymentStatus: paymentStatus || (paid >= total ? "paid" : paid > 0 ? "partial" : "unpaid"),
      amountPaid: paid,
      amountDue,
      expectedDeliveryDate: expectedDeliveryDate || undefined,
      note,
      createdBy: req.user.id,
    });

    const populated = await Purchase.findById(purchase._id)
      .populate("supplier", "name email phone")
      .populate("createdBy", "name email")
      .populate("items.product", "name sku price costPrice");

    res.status(201).json({
      success: true,
      purchase: populated,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
           
      
      success: false,
      message: "Failed to create purchase",
      error: error.message,
    });
  }
};

const getPurchases = async (req, res) => {
  try {
    const {
      search,
      status,
      paymentStatus,
      supplier,
      startDate,
      endDate,
      page = 1,
      limit = 20,
    } = req.query;

    const query = {};

    if (search) {
      query.purchaseNumber = { $regex: search, $options: "i" };
    }

    if (status) query.status = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;
    if (supplier) query.supplier = supplier;

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

    const [purchases, total] = await Promise.all([
      Purchase.find(query)
        .populate("supplier", "name email phone")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Purchase.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: purchases.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      purchases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch purchases",
      error: error.message,
    });
  }
};

const getPurchaseById = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id)
      .populate("supplier", "name email phone address contactPerson")
      .populate("createdBy", "name email")
      .populate("items.product", "name sku price costPrice image quantity");

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    res.status(200).json({
      success: true,
      purchase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch purchase",
      error: error.message,
    });
  }
};

const updatePurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    if (purchase.status === "received" || purchase.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: `Cannot edit a ${purchase.status} purchase order`,
      });
    }

    const {
      status,
      paymentStatus,
      paymentMethod,
      amountPaid,
      expectedDeliveryDate,
      note,
    } = req.body;

    if (status) purchase.status = status;
    if (paymentMethod) purchase.paymentMethod = paymentMethod;
    if (expectedDeliveryDate) purchase.expectedDeliveryDate = expectedDeliveryDate;
    if (note !== undefined) purchase.note = note;

    if (amountPaid !== undefined) {
      purchase.amountPaid = Number(amountPaid);
      purchase.amountDue = Math.max(0, purchase.total - purchase.amountPaid);
      purchase.paymentStatus =
        purchase.amountPaid >= purchase.total
          ? "paid"
          : purchase.amountPaid > 0
          ? "partial"
          : "unpaid";
    } else if (paymentStatus) {
      purchase.paymentStatus = paymentStatus;
    }

    await purchase.save();

    res.status(200).json({
      success: true,
      purchase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update purchase",
      error: error.message,
    });
  }
};

const receiveStock = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { receivedItems } = req.body;

    const purchase = await Purchase.findById(req.params.id).session(session);

    if (!purchase) {
      await session.abortTransaction();
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    if (purchase.status === "cancelled") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Cannot receive stock for a cancelled purchase",
      });
    }

    if (purchase.status === "received") {
      await session.abortTransaction();
      return res.status(400).json({
        success: false,
        message: "Purchase has already been fully received",
      });
    }

    for (const received of receivedItems) {
      const itemIndex = purchase.items.findIndex(
        (i) => i._id.toString() === received.itemId || i.product.toString() === received.productId
      );

      if (itemIndex === -1) continue;

      const purchaseItem = purchase.items[itemIndex];
      const maxReceivable = purchaseItem.quantity - purchaseItem.receivedQuantity;

      if (received.quantity <= 0 || received.quantity > maxReceivable) continue;

      purchaseItem.receivedQuantity += received.quantity;

      const product = await Product.findById(purchaseItem.product).session(session);

      if (product) {
        const previousQuantity = product.quantity;
        const newQuantity = previousQuantity + received.quantity;

        product.quantity = newQuantity;
        await product.save({ session });

        await StockLog.create(
          [
            {
              product: product._id,
              type: "in",
              quantity: received.quantity,
              previousQuantity,
              newQuantity,
              reason: "purchase",
              note: `Purchase order: ${purchase.purchaseNumber}`,
              reference: purchase.purchaseNumber,
              createdBy: req.user.id,
            },
          ],
          { session }
        );
      }
    }

    const allReceived = purchase.items.every(
      (i) => i.receivedQuantity >= i.quantity
    );
    const anyReceived = purchase.items.some((i) => i.receivedQuantity > 0);

    if (allReceived) {
      purchase.status = "received";
      purchase.receivedAt = new Date();
    } else if (anyReceived) {
      purchase.status = "partial";
    }

    await purchase.save({ session });
    await session.commitTransaction();

    const populated = await Purchase.findById(purchase._id)
      .populate("supplier", "name email phone")
      .populate("createdBy", "name email")
      .populate("items.product", "name sku quantity");

    res.status(200).json({
      success: true,
      message: allReceived
        ? "All items received. Purchase completed."
        : "Partial stock received.",
      purchase: populated,
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: "Failed to receive stock",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

const cancelPurchase = async (req, res) => {
  try {
    const purchase = await Purchase.findById(req.params.id);

    if (!purchase) {
      return res.status(404).json({
        success: false,
        message: "Purchase not found",
      });
    }

    if (purchase.status === "received") {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel a fully received purchase order",
      });
    }

    if (purchase.status === "cancelled") {
      return res.status(400).json({
        success: false,
        message: "Purchase is already cancelled",
      });
    }

    purchase.status = "cancelled";
    purchase.paymentStatus = "cancelled";
    await purchase.save();

    res.status(200).json({
      success: true,
      message: "Purchase order cancelled",
      purchase,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to cancel purchase",
      error: error.message,
    });
  }
};

const getPurchaseStats = async (req, res) => {
  try {
    const [stats, byStatus, recentPurchases] = await Promise.all([
      Purchase.aggregate([
        { $match: { status: { $ne: "cancelled" } } },
        {
          $group: {
            _id: null,
            totalSpent: { $sum: "$total" },
            totalOrders: { $sum: 1 },
            totalPaid: { $sum: "$amountPaid" },
            totalDue: { $sum: "$amountDue" },
          },
        },
      ]),

      Purchase.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            total: { $sum: "$total" },
          },
        },
      ]),

      Purchase.find({ status: { $in: ["pending", "ordered", "partial"] } })
        .populate("supplier", "name")
        .sort({ expectedDeliveryDate: 1 })
        .limit(5)
        .select("purchaseNumber supplier total status expectedDeliveryDate"),
    ]);

    res.status(200).json({
      success: true,
      stats: stats[0] || {
        totalSpent: 0,
        totalOrders: 0,
        totalPaid: 0,
        totalDue: 0,
      },
      byStatus,
      recentPurchases,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch purchase stats",
      error: error.message,
    });
  }
};

export {
  createPurchase,
  getPurchases,
  getPurchaseById,
  updatePurchase,
  receiveStock,
  cancelPurchase,
  getPurchaseStats,
};