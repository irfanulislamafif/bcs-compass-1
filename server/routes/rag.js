import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  askPdf,
  pdfMcq,
  pdfAnalyze,
} from '../controllers/ragController.js';

const router = express.Router();

router.use(requireAuth);

router.post('/ask', askPdf);
router.post('/mcq', pdfMcq);
router.post('/analyze', pdfAnalyze);

export default router;