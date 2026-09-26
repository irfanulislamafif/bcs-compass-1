import express from "express";
import {
  register,
  login,
  refresh,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/refresh", refresh);

router.post("/forgot-password", forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user.toJSON() });
});

router.post("/change-password", requireAuth, changePassword);

export default router;
