import express from "express";
import {
  register,
  login,
  getMe,
  updatePassword,
  logout,
} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);
router.put("/update-password", authMiddleware, updatePassword);
router.post("/logout", authMiddleware, logout);

export default router;