import mongoose from "mongoose";
import Product from "../models/Product.js";
import StockLog from "../models/StockLog.js";
import Notification from "../models/Notification.js";

const createLowStockNotification = async (product, req) => {
  if (!product) return;

  if (product.quantity <= product.lowStockThreshold) {
    await Notification.create({
      type: product.quantity === 0 ? "out_of_stock" : "low_stock",
      title:
        product.quantity === 0 ? "Out of Stock Alert" : "Low Stock Alert",
      message: `${product.name} is now at ${product.quantity} units`,
      product: product._id,
      user: req.user.id,
    });
  }
};

const addStock = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { productId, quantity, reason, note, reference } = req.body;

    const product = await Product.findById(productId).session(session);

    const previousQuantity = product.quantity;
    const newQuantity = previousQuantity + Number(quantity);

    product.quantity = newQuantity;
    await product.save({ session });

    const log = await StockLog.create(
      [
        {
          product: productId,
          type: "in",
          quantity,
          previousQuantity,
          newQuantity,
          reason: reason || "purchase",
          note,
          reference,
          createdBy: req.user.id,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    await createLowStockNotification(product, req);

    res.status(201).json({
      success: true,
      product,
      log: log[0],
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: "Failed to add stock",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

/* ---------------- REMOVE STOCK ---------------- */
const removeStock = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { productId, quantity, reason, note, reference } = req.body;

    const product = await Product.findById(productId).session(session);

    const previousQuantity = product.quantity;
    const newQuantity = previousQuantity - Number(quantity);

    product.quantity = newQuantity;
    await product.save({ session });

    const log = await StockLog.create(
      [
        {
          product: productId,
          type: "out",
          quantity,
          previousQuantity,
          newQuantity,
          reason: reason || "sale",
          note,
          reference,
          createdBy: req.user.id,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    await createLowStockNotification(product, req);

    res.status(201).json({
      success: true,
      product,
      log: log[0],
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: "Failed to remove stock",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

const adjustStock = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { productId, newQuantity, note } = req.body;

    const product = await Product.findById(productId).session(session);

    const previousQuantity = product.quantity;

    product.quantity = newQuantity;
    await product.save({ session });

    const log = await StockLog.create(
      [
        {
          product: productId,
          type: "adjustment",
          quantity: Math.abs(newQuantity - previousQuantity) || 1,
          previousQuantity,
          newQuantity,
          reason: "correction",
          note,
          createdBy: req.user.id,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    await createLowStockNotification(product, req);

    res.status(201).json({
      success: true,
      product,
      log: log[0],
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({
      success: false,
      message: "Failed to adjust stock",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

const getProductStockHistory = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      StockLog.find({ product: productId })
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      StockLog.countDocuments({ product: productId }),
    ]);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch stock history",
      error: error.message,
    });
  }
};


const getAllStockLogs = async (req, res) => {
  try {
    const { type, reason, page = 1, limit = 20 } = req.query;

    const query = {};
    if (type) query.type = type;
    if (reason) query.reason = reason;

    const skip = (Number(page) - 1) * Number(limit);

    const [logs, total] = await Promise.all([
      StockLog.find(query)
        .populate("product", "name sku")
        .populate("createdBy", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      StockLog.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
      logs,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch stock logs",
      error: error.message,
    });
  }
};


export {
  addStock,
  removeStock,
  adjustStock,
  getProductStockHistory,
  getAllStockLogs,
};