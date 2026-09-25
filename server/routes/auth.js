import express from 'express';
import {
  register,
  login,
  refresh,
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);

router.get('/me', requireAuth, (req, res) => {
  res.json({ user: req.user.toJSON() });
});

export default router;