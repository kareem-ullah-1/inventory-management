import express from "express";

import {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updatePaymentStatus,
  deleteInvoice,
} from "../controllers/invoice.js";

import authMiddleware, { authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, authorize("admin", "staff"), getInvoices);

router.post("/", authMiddleware, authorize("admin", "staff"), createInvoice);

router.get("/:id", authMiddleware, authorize("admin", "staff"), getInvoiceById);

router.patch(
  "/:id/payment-status",
  authMiddleware,
  authorize("admin"),
  updatePaymentStatus
);

router.delete(
  "/:id",
  authMiddleware,
  authorize("admin"),
  deleteInvoice
);

export default router;