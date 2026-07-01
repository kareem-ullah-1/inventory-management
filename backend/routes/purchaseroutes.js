import express from "express";
import {
  createPurchase,
  getPurchases,
  getPurchaseById,
  updatePurchase,
  receiveStock,
  cancelPurchase,
} from "../controllers/purchaseController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getPurchases);

router.get("/:id", authMiddleware, getPurchaseById);

router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  createPurchase
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  updatePurchase
);

router.put(
  "/:id/receive",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  receiveStock
);

router.put(
  "/:id/cancel",
  authMiddleware,
  authorizeRoles("admin"),
  cancelPurchase
);

export default router;