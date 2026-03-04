const express = require('express');
const db = require('../db/database');
const { authenticate, requireRole, requireApproved } = require('../middleware/auth');

const router = express.Router();

// ─── AI Placeholder ───────────────────────────────────────────────────────────
/**
 * TODO: AI Integration Point
 * suggestPricingByAI(expertId, demandData) — dynamically adjusts pricing
 * based on demand signals, expert rating, and market benchmarks.
 */
async function suggestPricingByAI(expertId, demandData) {
  console.log('[AI Placeholder] suggestPricingByAI called — returning base rate');
  return null; // Returns null until AI pricing is implemented
}

// ─── POST /api/bookings ───────────────────────────────────────────────────────
router.post('/', authenticate, requireApproved, requireRole('business'), (req, res) => {
  const {
    provider_id,
    provider_type,
    slot_start,
    slot_end,
    problem_description,
    total_price,
  } = req.body;

  if (!provider_id || !provider_type || !slot_start || !slot_end) {
    return res.status(400).json({ error: 'provider_id, provider_type, slot_start, slot_end are required' });
  }

  if (!['expert', 'lab'].includes(provider_type)) {
    return res.status(400).json({ error: 'provider_type must be expert or lab' });
  }

  // Verify provider exists and is approved
  let provider;
  if (provider_type === 'expert') {
    provider = db.prepare(`
      SELECT e.id FROM experts e
      JOIN users u ON e.user_id = u.id
      WHERE e.id = ? AND u.status = 'approved'
    `).get(provider_id);
  } else {
    provider = db.prepare(`
      SELECT l.id FROM labs l
      JOIN users u ON l.user_id = u.id
      WHERE l.id = ? AND u.status = 'approved'
    `).get(provider_id);
  }

  if (!provider) {
    return res.status(404).json({ error: 'Provider not found or not approved' });
  }

  const result = db.prepare(`
    INSERT INTO bookings (business_user_id, provider_id, provider_type, slot_start, slot_end, status, problem_description, total_price)
    VALUES (?, ?, ?, ?, ?, 'pending', ?, ?)
  `).run(req.user.id, provider_id, provider_type, slot_start, slot_end, problem_description || '', total_price || 0);

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(booking);
});

// ─── GET /api/bookings ────────────────────────────────────────────────────────
router.get('/', authenticate, requireApproved, (req, res) => {
  let bookings;

  if (req.user.role === 'business') {
    bookings = db.prepare(`
      SELECT b.*,
        CASE b.provider_type
          WHEN 'expert' THEN (SELECT u.name FROM experts e JOIN users u ON e.user_id = u.id WHERE e.id = b.provider_id)
          WHEN 'lab'    THEN (SELECT l.name FROM labs l WHERE l.id = b.provider_id)
        END as provider_name,
        CASE b.provider_type
          WHEN 'expert' THEN (SELECT e.location FROM experts e WHERE e.id = b.provider_id)
          WHEN 'lab'    THEN (SELECT l.location FROM labs l WHERE l.id = b.provider_id)
        END as provider_location
      FROM bookings b
      WHERE b.business_user_id = ?
      ORDER BY b.created_at DESC
    `).all(req.user.id);
  } else if (req.user.role === 'expert') {
    const expert = db.prepare('SELECT id FROM experts WHERE user_id = ?').get(req.user.id);
    if (!expert) return res.json([]);
    bookings = db.prepare(`
      SELECT b.*,
        u.name as business_name, u.email as business_email
      FROM bookings b
      JOIN users u ON b.business_user_id = u.id
      WHERE b.provider_id = ? AND b.provider_type = 'expert'
      ORDER BY b.created_at DESC
    `).all(expert.id);
  } else if (req.user.role === 'lab') {
    const lab = db.prepare('SELECT id FROM labs WHERE user_id = ?').get(req.user.id);
    if (!lab) return res.json([]);
    bookings = db.prepare(`
      SELECT b.*,
        u.name as business_name, u.email as business_email
      FROM bookings b
      JOIN users u ON b.business_user_id = u.id
      WHERE b.provider_id = ? AND b.provider_type = 'lab'
      ORDER BY b.created_at DESC
    `).all(lab.id);
  } else if (req.user.role === 'admin') {
    bookings = db.prepare(`
      SELECT b.*,
        u.name as business_name,
        CASE b.provider_type
          WHEN 'expert' THEN (SELECT u2.name FROM experts e JOIN users u2 ON e.user_id = u2.id WHERE e.id = b.provider_id)
          WHEN 'lab'    THEN (SELECT l.name FROM labs l WHERE l.id = b.provider_id)
        END as provider_name
      FROM bookings b
      JOIN users u ON b.business_user_id = u.id
      ORDER BY b.created_at DESC
    `).all();
  }

  res.json(bookings || []);
});

// ─── GET /api/bookings/:id ────────────────────────────────────────────────────
router.get('/:id', authenticate, requireApproved, (req, res) => {
  const booking = db.prepare(`
    SELECT b.*,
      u.name as business_name, u.email as business_email,
      CASE b.provider_type
        WHEN 'expert' THEN (SELECT u2.name FROM experts e JOIN users u2 ON e.user_id = u2.id WHERE e.id = b.provider_id)
        WHEN 'lab'    THEN (SELECT l.name FROM labs l WHERE l.id = b.provider_id)
      END as provider_name,
      CASE b.provider_type
        WHEN 'expert' THEN (SELECT e.location FROM experts e WHERE e.id = b.provider_id)
        WHEN 'lab'    THEN (SELECT l.location FROM labs l WHERE l.id = b.provider_id)
      END as provider_location
    FROM bookings b
    JOIN users u ON b.business_user_id = u.id
    WHERE b.id = ?
  `).get(req.params.id);

  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  // Access control
  if (req.user.role === 'business' && booking.business_user_id !== req.user.id) {
    return res.status(403).json({ error: 'Access denied' });
  }
  if (req.user.role === 'expert') {
    const expert = db.prepare('SELECT id FROM experts WHERE user_id = ?').get(req.user.id);
    if (!expert || booking.provider_type !== 'expert' || booking.provider_id !== expert.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
  }
  if (req.user.role === 'lab') {
    const lab = db.prepare('SELECT id FROM labs WHERE user_id = ?').get(req.user.id);
    if (!lab || booking.provider_type !== 'lab' || booking.provider_id !== lab.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
  }

  // Include report if exists
  const report = db.prepare('SELECT * FROM reports WHERE booking_id = ?').get(booking.id);
  booking.report = report || null;

  res.json(booking);
});

// ─── PUT /api/bookings/:id/status ─────────────────────────────────────────────
router.put('/:id/status', authenticate, requireApproved, (req, res) => {
  const { status } = req.body;
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  // Business user: can cancel their own bookings or confirm payment
  if (req.user.role === 'business') {
    if (booking.business_user_id !== req.user.id) return res.status(403).json({ error: 'Access denied' });
    if (!['cancelled', 'confirmed'].includes(status)) return res.status(400).json({ error: 'Business can only cancel or confirm (payment) bookings' });
  }

  // Expert/Lab: can confirm or reject bookings assigned to them
  if (req.user.role === 'expert') {
    const expert = db.prepare('SELECT id FROM experts WHERE user_id = ?').get(req.user.id);
    if (!expert || booking.provider_type !== 'expert' || booking.provider_id !== expert.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (!['confirmed', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Expert can confirm, reject, or complete bookings' });
    }
  }

  if (req.user.role === 'lab') {
    const lab = db.prepare('SELECT id FROM labs WHERE user_id = ?').get(req.user.id);
    if (!lab || booking.provider_type !== 'lab' || booking.provider_id !== lab.id) {
      return res.status(403).json({ error: 'Access denied' });
    }
    if (!['confirmed', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Lab can confirm, reject, or complete bookings' });
    }
  }

  db.prepare('UPDATE bookings SET status = ? WHERE id = ?').run(status, req.params.id);
  const updated = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.id);
  res.json(updated);
});

module.exports = router;
