import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from '../utils/tokens.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function register(req, res, next) {
  try {
    const { name, email, password, targetExam } = req.body || {};

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: 'Name, email and password are required.' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Invalid email address.' });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ message: 'Password must be at least 8 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email is already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      targetExam: targetExam || 'BCS',
    });

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());

    res.status(201).json({
      user: user.toJSON(),
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const accessToken = signAccessToken(user._id.toString());
    const refreshToken = signRefreshToken(user._id.toString());

    res.json({
      user: user.toJSON(),
      accessToken,
      refreshToken,
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req, res, next) {
  try {
    const { refreshToken } = req.body || {};
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token required.' });
    }

    let payload;
    try {
      payload = verifyRefreshToken(refreshToken);
    } catch {
      return res.status(401).json({ message: 'Invalid refresh token.' });
    }
    if (payload.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid token type.' });
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: 'User no longer exists.' });
    }

    const accessToken = signAccessToken(user._id.toString());
    res.json({ accessToken });
  } catch (err) {
    next(err);
  }
}