import express from "express";
import {
  register,
  login,
  getMe,
  updatePassword,
  logout,
  forgotPassword,
  resetPassword,

} from "../controllers/authController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);
router.put("/update-password", authMiddleware, updatePassword);
router.post("/logout", authMiddleware, logout);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
export default router;