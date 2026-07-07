import express from "express";
import {
  getSalesReport,
  getStockReport,
  getPurchaseReport,
  getProfitLossReport,
  getCustomerReport,
} from "../controllers/reportcontroller.js";

import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/sales",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  getSalesReport
);

router.get(
  "/stock",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  getStockReport
);

router.get(
  "/purchases",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  getPurchaseReport
);

router.get(
  "/profit-loss",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  getProfitLossReport
);

router.get(
  "/customers",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  getCustomerReport
);

export default router;