

import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },

    sale: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sale",
      required: true,
    },

    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
    },

    issueDate: {
      type: Date,
      default: Date.now,
    },

    dueDate: {
      type: Date,
    },

    subtotal: Number,
    taxAmount: Number,
    discountAmount: Number,
    total: Number,

    paymentStatus: {
      type: String,
      enum: ["paid", "pending", "partial", "overdue"],
      default: "pending",
    },

    pdfUrl: String,

    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);