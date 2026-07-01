import express from "express";
import {
  createCategory,
  getCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getCategories);

router.get("/:id", authMiddleware, getCategoryById);

router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  createCategory
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin" ),
  updateCategory
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  deleteCategory
);

export default router;