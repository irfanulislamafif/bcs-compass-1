import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import {
  analyze,
  generateMcq,
  generateWritten,
  generateFlashcards,
  generateNotes,
  extractFacts,
  extractMemorize,
  history,
} from '../controllers/aiController.js';

const router = express.Router();

router.use(requireAuth);

router.post('/analyze', analyze);
router.post('/mcq', generateMcq);
router.post('/written', generateWritten);
router.post('/flashcards', generateFlashcards);
router.post('/notes', generateNotes);
router.post('/facts', extractFacts);
router.post('/memorize', extractMemorize);

router.get('/history', history);

export default router;