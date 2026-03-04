const express = require('express');
const db = require('../db/database');
const { authenticate, requireRole, requireApproved } = require('../middleware/auth');

const router = express.Router();

// ─── AI Placeholder ───────────────────────────────────────────────────────────
/**
 * TODO: AI Integration Point
 * matchExpertByAI(problemDescription) — uses embeddings/LLM to rank experts
 * by semantic similarity to the problem description.
 * Replace the manual tag-matching below with this when ready.
 */
async function matchExpertByAI(problemDescription, experts) {
  // PLACEHOLDER: Return experts as-is until AI matching is implemented
  console.log('[AI Placeholder] matchExpertByAI called — returning unranked results');
  return experts;
}

// ─── GET /api/experts ─────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const { expertise, min_price, max_price, location, search } = req.query;

  let experts = db.prepare(`
    SELECT e.*, u.name, u.email, u.status
    FROM experts e
    JOIN users u ON e.user_id = u.id
    WHERE u.status = 'approved'
  `).all();

  // Parse JSON fields
  experts = experts.map(e => ({
    ...e,
    expertise_tags: JSON.parse(e.expertise_tags || '[]'),
    availability_json: JSON.parse(e.availability_json || '{}'),
  }));

  // Filters
  if (expertise) {
    const tags = expertise.split(',').map(t => t.trim().toLowerCase());
    experts = experts.filter(e =>
      e.expertise_tags.some(tag => tags.some(t => tag.toLowerCase().includes(t)))
    );
  }
  if (min_price) experts = experts.filter(e => e.hourly_rate >= Number(min_price));
  if (max_price) experts = experts.filter(e => e.hourly_rate <= Number(max_price));
  if (location)  experts = experts.filter(e => e.location?.toLowerCase().includes(location.toLowerCase()));
  if (search) {
    const q = search.toLowerCase();
    experts = experts.filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.bio?.toLowerCase().includes(q) ||
      e.expertise_tags.some(t => t.toLowerCase().includes(q))
    );
  }

  res.json(experts);
});

// ─── GET /api/experts/:id ──────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const expert = db.prepare(`
    SELECT e.*, u.name, u.email, u.status, u.created_at as member_since
    FROM experts e
    JOIN users u ON e.user_id = u.id
    WHERE e.id = ?
  `).get(req.params.id);

  if (!expert) return res.status(404).json({ error: 'Expert not found' });

  expert.expertise_tags = JSON.parse(expert.expertise_tags || '[]');
  expert.availability_json = JSON.parse(expert.availability_json || '{}');

  res.json(expert);
});

// ─── PUT /api/experts/:id ─────────────────────────────────────────────────────
router.put('/:id', authenticate, requireApproved, requireRole('expert', 'admin'), (req, res) => {
  const expert = db.prepare('SELECT * FROM experts WHERE id = ?').get(req.params.id);
  if (!expert) return res.status(404).json({ error: 'Expert not found' });

  // Experts can only edit their own profile
  if (req.user.role === 'expert' && expert.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Cannot edit another expert\'s profile' });
  }

  const { bio, expertise_tags, location, hourly_rate, availability_json } = req.body;

  db.prepare(`
    UPDATE experts SET
      bio = COALESCE(?, bio),
      expertise_tags = COALESCE(?, expertise_tags),
      location = COALESCE(?, location),
      hourly_rate = COALESCE(?, hourly_rate),
      availability_json = COALESCE(?, availability_json)
    WHERE id = ?
  `).run(
    bio ?? null,
    expertise_tags ? JSON.stringify(expertise_tags) : null,
    location ?? null,
    hourly_rate ?? null,
    availability_json ? JSON.stringify(availability_json) : null,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM experts WHERE id = ?').get(req.params.id);
  updated.expertise_tags = JSON.parse(updated.expertise_tags || '[]');
  updated.availability_json = JSON.parse(updated.availability_json || '{}');

  res.json(updated);
});

module.exports = router;
