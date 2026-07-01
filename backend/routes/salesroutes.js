import express from "express";
import {
  createSales,
  getSales,
  getSalesById,
  updateSalesStatus,
  cancelSales,
  getSalesStats,
} from "../controllers/salesController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getSales);

router.get("/stats", authMiddleware, authorizeRoles("admin"), getSalesStats);

router.get("/:id", authMiddleware, getSalesById);

router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin", "manager", "staff"),
  createSales
);

router.put(
  "/:id/status",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  updateSalesStatus
);

router.put(
  "/:id/cancel",
  authMiddleware,
  authorizeRoles("admin"),
  cancelSales
);

export default router;