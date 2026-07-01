import express from "express";
import { chat } from "../controllers/aichatController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", authMiddleware, chat);

export default router;