import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

import {
  getProductForecast,
  getLowStockForecast,
  getInventoryHealth,
  getSalesForecast,
} from "../controllers/aiForecastController.js";

const router = express.Router();

// Inventory Health Analysis
router.get(
  "/inventory-health",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  getInventoryHealth
);

// Low Stock Forecast
router.get(
  "/low-stock",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  getLowStockForecast
);

// Sales Trend Forecast
router.get(
  "/sales-trend",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  getSalesForecast
);

// Single Product Forecast
router.get(
  "/product/:productId",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  getProductForecast
);

export default router;