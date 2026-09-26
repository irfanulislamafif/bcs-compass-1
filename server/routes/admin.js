import express from "express";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import {
  getStats,
  listUsers,
  updateUserRole,
  listQuestionsForAdmin,
  moderateQuestion,
  deleteQuestionAdmin,
  listGenerations,
  listMaterialsAdmin,
} from "../controllers/adminController.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get("/stats", getStats);

router.get("/users", listUsers);
router.patch("/users/:id", updateUserRole);

router.get("/questions", listQuestionsForAdmin);
router.patch("/questions/:id", moderateQuestion);
router.delete("/questions/:id", deleteQuestionAdmin);

router.get("/generations", listGenerations);
router.get("/materials", listMaterialsAdmin);

export default router;
