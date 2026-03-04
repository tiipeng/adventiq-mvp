const express = require('express');
const db = require('../db/database');
const { authenticate, requireRole } = require('../middleware/auth');

const router = express.Router();

// All admin routes require authentication + admin role
router.use(authenticate, requireRole('admin'));

// ─── GET /api/admin/stats ──────────────────────────────────────────────────────
router.get('/stats', (req, res) => {
  const stats = {
    users: {
      total: db.prepare('SELECT COUNT(*) as n FROM users WHERE role != \'admin\'').get().n,
      pending: db.prepare('SELECT COUNT(*) as n FROM users WHERE status = \'pending\'').get().n,
      business: db.prepare('SELECT COUNT(*) as n FROM users WHERE role = \'business\'').get().n,
      expert: db.prepare('SELECT COUNT(*) as n FROM users WHERE role = \'expert\'').get().n,
      lab: db.prepare('SELECT COUNT(*) as n FROM users WHERE role = \'lab\'').get().n,
    },
    bookings: {
      total: db.prepare('SELECT COUNT(*) as n FROM bookings').get().n,
      pending: db.prepare('SELECT COUNT(*) as n FROM bookings WHERE status = \'pending\'').get().n,
      confirmed: db.prepare('SELECT COUNT(*) as n FROM bookings WHERE status = \'confirmed\'').get().n,
      completed: db.prepare('SELECT COUNT(*) as n FROM bookings WHERE status = \'completed\'').get().n,
    },
    revenue: {
      total: db.prepare('SELECT COALESCE(SUM(total_price), 0) as n FROM bookings WHERE status IN (\'confirmed\',\'completed\')').get().n,
    },
  };
  res.json(stats);
});

// ─── GET /api/admin/users ─────────────────────────────────────────────────────
router.get('/users', (req, res) => {
  const { role, status } = req.query;

  let query = 'SELECT id, name, email, role, status, created_at FROM users WHERE 1=1';
  const params = [];

  if (role) { query += ' AND role = ?'; params.push(role); }
  if (status) { query += ' AND status = ?'; params.push(status); }

  query += ' ORDER BY created_at DESC';

  const users = db.prepare(query).all(...params);

  // Attach expert/lab profiles
  const enriched = users.map(u => {
    let profile = null;
    if (u.role === 'expert') {
      profile = db.prepare('SELECT id, bio, expertise_tags, location, hourly_rate, rating FROM experts WHERE user_id = ?').get(u.id);
      if (profile) profile.expertise_tags = JSON.parse(profile.expertise_tags || '[]');
    }
    if (u.role === 'lab') {
      profile = db.prepare('SELECT id, name, description, location, services_json, price_per_day, rating FROM labs WHERE user_id = ?').get(u.id);
      if (profile) profile.services_json = JSON.parse(profile.services_json || '[]');
    }
    return { ...u, profile };
  });

  res.json(enriched);
});

// ─── PUT /api/admin/users/:id/status ─────────────────────────────────────────
router.put('/users/:id/status', (req, res) => {
  const { status } = req.body;
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    return res.status(400).json({ error: 'status must be approved, rejected, or pending' });
  }

  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.role === 'admin') return res.status(400).json({ error: 'Cannot change admin status' });

  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, req.params.id);
  const updated = db.prepare('SELECT id, name, email, role, status FROM users WHERE id = ?').get(req.params.id);
  res.json(updated);
});

// ─── GET /api/admin/bookings ──────────────────────────────────────────────────
router.get('/bookings', (req, res) => {
  const { status } = req.query;

  let query = `
    SELECT b.*,
      u.name as business_name, u.email as business_email,
      CASE b.provider_type
        WHEN 'expert' THEN (SELECT u2.name FROM experts e JOIN users u2 ON e.user_id = u2.id WHERE e.id = b.provider_id)
        WHEN 'lab'    THEN (SELECT l.name FROM labs l WHERE l.id = b.provider_id)
      END as provider_name
    FROM bookings b
    JOIN users u ON b.business_user_id = u.id
    WHERE 1=1
  `;
  const params = [];

  if (status) { query += ' AND b.status = ?'; params.push(status); }
  query += ' ORDER BY b.created_at DESC';

  const bookings = db.prepare(query).all(...params);
  res.json(bookings);
});

// ─── DELETE /api/admin/users/:id ──────────────────────────────────────────────
router.delete('/users/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  if (user.role === 'admin') return res.status(400).json({ error: 'Cannot delete admin' });

  db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
  res.json({ message: 'User deleted' });
});

module.exports = router;
