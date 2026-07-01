import express from "express";
import {
  addStock,
  removeStock,
  adjustStock,
  getProductStockHistory,
  getAllStockLogs,
} from "../controllers/stockController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import { authorize } from "../middleware/authMiddleware.js";

const router = express.Router();


router.post(
  "/in",
  authMiddleware,
  authorize("admin", "staff"),
  addStock
);


router.post(
  "/out",
  authMiddleware,
  authorize("admin", "staff"),
  removeStock
);


router.put(
  "/adjust",
  authMiddleware,
  authorize("admin"),
  adjustStock
);


router.get(
  "/product/:productId",
  authMiddleware,
  getProductStockHistory
);


router.get(
  "/logs",
  authMiddleware,
  getAllStockLogs
);

export default router;