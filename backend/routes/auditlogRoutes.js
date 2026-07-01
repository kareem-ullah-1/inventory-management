import express from "express";
import { getAuditLogs, clearAuditLogs } from "../controllers/auditLogController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  getAuditLogs
);

router.delete(
  "/",
  authMiddleware,
  authorizeRoles("admin"),
  clearAuditLogs
);

export default router;