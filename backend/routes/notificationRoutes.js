import express from "express";
import {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
} from "../controllers/notificationController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();


router.use(authMiddleware);


router.post("/", createNotification);


router.get("/", getNotifications);


router.put("/:id/read", markAsRead);


router.put("/read-all", markAllAsRead);

router.delete("/:id", deleteNotification);

export default router;