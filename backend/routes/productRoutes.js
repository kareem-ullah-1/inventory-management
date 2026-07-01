import express from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getProducts);

router.get("/:id", authMiddleware, getProductById);

router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  createProduct
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  updateProduct
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  deleteProduct
);

export default router;