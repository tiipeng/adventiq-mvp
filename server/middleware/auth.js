const jwt = require('jsonwebtoken');
const db = require('../db/database');

const JWT_SECRET = process.env.JWT_SECRET || 'adventiq-super-secret-jwt-key-change-in-production';

/**
 * Verify JWT and attach req.user = { id, role, status }
 */
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = db.prepare('SELECT id, name, email, role, status FROM users WHERE id = ?').get(payload.userId);
    if (!user) return res.status(401).json({ error: 'User not found' });
    req.user = user;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Middleware factory — restrict to specific roles
 * Usage: requireRole('admin') or requireRole('expert', 'admin')
 */
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access denied. Required role: ${roles.join(' or ')}` });
    }
    next();
  };
}

/**
 * Middleware — require approved status (except admin)
 */
function requireApproved(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
  if (req.user.role !== 'admin' && req.user.status !== 'approved') {
    return res.status(403).json({
      error: 'Account pending approval. An admin will review your registration shortly.',
    });
  }
  next();
}

module.exports = { authenticate, requireRole, requireApproved, JWT_SECRET };
