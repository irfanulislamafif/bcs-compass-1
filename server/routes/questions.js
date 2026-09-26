import express from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  saveQuestions,
  saveManualQuestion,
  listQuestions,
  getQuestion,
  updateQuestion,
  deleteQuestion,
} from "../controllers/questionController.js";

const router = express.Router();

router.use(requireAuth);

router.post("/", saveQuestions);
router.post("/manual", saveManualQuestion);
router.get("/", listQuestions);
router.get("/:id", getQuestion);
router.patch("/:id", updateQuestion);
router.delete("/:id", deleteQuestion);

export default router;
