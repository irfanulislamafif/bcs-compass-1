import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  buildExam,
  getExam,
  listExams,
} from '../controllers/examController.js';

const router = express.Router();

router.use(requireAuth);

router.post('/build', buildExam);
router.get('/', listExams);
router.get('/:id', getExam);

export default router;