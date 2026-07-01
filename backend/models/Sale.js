import mongoose from "mongoose";

const saleItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product is required"],
    },
    name: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
    },
    unitPrice: {
      type: Number,
      required: [true, "Unit price is required"],
      min: [0, "Price cannot be negative"],
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    costPrice: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
    },
  },
  { _id: true }
);

const salesSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },
    customerName: {
      type: String,
      trim: true,
      default: "Walk-in Customer",
    },
    items: {
      type: [saleItemSchema],
      required: true,
      validate: {
        validator: (v) => v.length > 0,
        message: "Sale must have at least one item",
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    taxRate: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    taxAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "bank_transfer", "cheque", "other"],
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "partial", "cancelled"],
      default: "paid",
    },
    amountPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    amountDue: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ["completed", "pending", "cancelled", "refunded"],
      default: "completed",
    },
    note: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    soldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

salesSchema.index({ customer: 1, createdAt: -1 });
salesSchema.index({ status: 1, createdAt: -1 });
salesSchema.index({ createdAt: -1 });

salesSchema.virtual("profit").get(function () {
  return this.items.reduce((sum, item) => {
    const costPrice = item.costPrice || 0;
    return sum + (item.unitPrice - costPrice) * item.quantity;
  }, 0);
});

salesSchema.set("toJSON", { virtuals: true });
salesSchema.set("toObject", { virtuals: true });

const Sales = mongoose.model("Sales", salesSchema);

export default Sales;