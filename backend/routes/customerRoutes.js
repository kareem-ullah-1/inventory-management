import express from "express";
import {
  createCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customerController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getCustomers);

router.get("/:id", authMiddleware, getCustomerById);

router.post(
  "/",
  authMiddleware,
  authorizeRoles("admin", "manager", "staff"),
  createCustomer
);

router.put(
  "/:id",
  authMiddleware,
  authorizeRoles("admin", "manager"),
  updateCustomer
);

router.delete(
  "/:id",
  authMiddleware,
  authorizeRoles("admin"),
  deleteCustomer
);

export default router;