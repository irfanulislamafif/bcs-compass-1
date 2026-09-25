import { verifyAccessToken } from '../utils/tokens.js';
import User from '../models/User.js';

export async function requireAuth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Authentication required.' });
    }

    const payload = verifyAccessToken(token);
    if (payload.type !== 'access') {
      return res.status(401).json({ message: 'Invalid token type.' });
    }

    const user = await User.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({ message: 'Session expired or invalid.' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' });
  }
  next();
}