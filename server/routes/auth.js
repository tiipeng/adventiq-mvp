const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');
const { authenticate, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();

// ─── POST /api/auth/register ─────────────────────────────────────────────────
router.post('/register', (req, res) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password || !role) {
    return res.status(400).json({ error: 'name, email, password and role are required' });
  }

  const validRoles = ['business', 'expert', 'lab'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Role must be business, expert, or lab' });
  }

  const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (existing) {
    return res.status(409).json({ error: 'Email already registered' });
  }

  const hash = bcrypt.hashSync(password, 10);
  // Business users auto-approved; experts/labs need admin approval
  const status = role === 'business' ? 'approved' : 'pending';

  const result = db.prepare(`
    INSERT INTO users (name, email, password_hash, role, status)
    VALUES (?, ?, ?, ?, ?)
  `).run(name, email, hash, role, status);

  const userId = result.lastInsertRowid;

  // Create role-specific profile
  if (role === 'expert') {
    const { bio = '', expertise_tags = [], location = '', hourly_rate = 0 } = req.body;
    db.prepare(`
      INSERT INTO experts (user_id, bio, expertise_tags, location, hourly_rate)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, bio, JSON.stringify(expertise_tags), location, hourly_rate);
  }

  if (role === 'lab') {
    const { lab_name = name, description = '', location = '', services = [], price_per_day = 0 } = req.body;
    db.prepare(`
      INSERT INTO labs (user_id, name, description, location, services_json, price_per_day)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, lab_name, description, location, JSON.stringify(services), price_per_day);
  }

  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
  const user = db.prepare('SELECT id, name, email, role, status, created_at FROM users WHERE id = ?').get(userId);

  res.status(201).json({ token, user });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const valid = bcrypt.compareSync(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

  const { password_hash, ...safeUser } = user;
  res.json({ token, user: safeUser });
});

// ─── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', authenticate, (req, res) => {
  const user = db.prepare('SELECT id, name, email, role, status, created_at FROM users WHERE id = ?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User not found' });

  let profile = null;
  if (user.role === 'expert') {
    profile = db.prepare('SELECT * FROM experts WHERE user_id = ?').get(user.id);
    if (profile) profile.expertise_tags = JSON.parse(profile.expertise_tags || '[]');
    if (profile) profile.availability_json = JSON.parse(profile.availability_json || '{}');
  }
  if (user.role === 'lab') {
    profile = db.prepare('SELECT * FROM labs WHERE user_id = ?').get(user.id);
    if (profile) profile.services_json = JSON.parse(profile.services_json || '[]');
    if (profile) profile.availability_json = JSON.parse(profile.availability_json || '{}');
  }

  res.json({ user, profile });
});

module.exports = router;
