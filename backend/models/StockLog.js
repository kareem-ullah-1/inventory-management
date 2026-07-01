import mongoose from "mongoose";

const stockLogSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
    },
    type: {
      type: String,
      enum: ["in", "out", "adjustment"],
      required: [true, "Stock log type is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    previousQuantity: {
      type: Number,
      required: true,
    },
    newQuantity: {
      type: Number,
      required: true,
    },
    reason: {
      type: String,
      enum: [
        "purchase",
        "sale",
        "return",
        "damaged",
        "lost",
        "correction",
        "other",
      ],
      default: "other",
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    reference: {
      type: String,
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

stockLogSchema.index({ type: 1 });

const StockLog = mongoose.model("StockLog", stockLogSchema);

export default StockLog;