import express from "express";
import {
  createSupplier,
  getSuppliers,
  getSupplierById,
  updateSupplier,
  deleteSupplier,
} from "../controllers/supplierController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getSuppliers);

router.get("/:id", authMiddleware, getSupplierById);

router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  createSupplier
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  updateSupplier
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  deleteSupplier
);

export default router;