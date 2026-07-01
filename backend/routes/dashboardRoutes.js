import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";

import {
  getDashboardStats,
  getStockMovementSummary,
  getTopCategories,
} from "../controllers/dashboardController.js";

const router = express.Router();


router.get("/stats", authMiddleware, getDashboardStats);


router.get("/movement", authMiddleware, getStockMovementSummary);


router.get("/top-categories", authMiddleware, getTopCategories);

export default router;