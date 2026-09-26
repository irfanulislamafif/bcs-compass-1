import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  saveQuestions,
  listQuestions,
  getQuestion,
  deleteQuestion,
} from '../controllers/questionController.js';

const router = express.Router();

router.use(requireAuth);

router.post('/', saveQuestions);
router.get('/', listQuestions);
router.get('/:id', getQuestion);
router.delete('/:id', deleteQuestion);

export default router;