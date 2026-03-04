const express = require('express');
const db = require('../db/database');
const { authenticate, requireRole, requireApproved } = require('../middleware/auth');

const router = express.Router();

// ─── GET /api/labs ─────────────────────────────────────────────────────────────
router.get('/', (req, res) => {
  const { service, min_price, max_price, location, search } = req.query;

  let labs = db.prepare(`
    SELECT l.*, u.name as owner_name, u.email, u.status
    FROM labs l
    JOIN users u ON l.user_id = u.id
    WHERE u.status = 'approved'
  `).all();

  labs = labs.map(l => ({
    ...l,
    services_json: JSON.parse(l.services_json || '[]'),
    availability_json: JSON.parse(l.availability_json || '{}'),
    certifications_json: JSON.parse(l.certifications_json || '[]'),
    equipment_json: JSON.parse(l.equipment_json || '[]'),
  }));

  if (service) {
    const q = service.toLowerCase();
    labs = labs.filter(l => l.services_json.some(s => s.toLowerCase().includes(q)));
  }
  if (min_price) labs = labs.filter(l => l.price_per_day >= Number(min_price));
  if (max_price) labs = labs.filter(l => l.price_per_day <= Number(max_price));
  if (location)  labs = labs.filter(l => l.location?.toLowerCase().includes(location.toLowerCase()));
  if (search) {
    const q = search.toLowerCase();
    labs = labs.filter(l =>
      l.name?.toLowerCase().includes(q) ||
      l.description?.toLowerCase().includes(q) ||
      l.services_json.some(s => s.toLowerCase().includes(q))
    );
  }

  res.json(labs);
});

// ─── GET /api/labs/:id ────────────────────────────────────────────────────────
router.get('/:id', (req, res) => {
  const lab = db.prepare(`
    SELECT l.*, u.name as owner_name, u.email, u.status, u.created_at as member_since
    FROM labs l
    JOIN users u ON l.user_id = u.id
    WHERE l.id = ?
  `).get(req.params.id);

  if (!lab) return res.status(404).json({ error: 'Lab not found' });

  lab.services_json = JSON.parse(lab.services_json || '[]');
  lab.availability_json = JSON.parse(lab.availability_json || '{}');
  lab.certifications_json = JSON.parse(lab.certifications_json || '[]');
  lab.equipment_json = JSON.parse(lab.equipment_json || '[]');

  res.json(lab);
});

// ─── PUT /api/labs/:id ────────────────────────────────────────────────────────
router.put('/:id', authenticate, requireApproved, requireRole('lab', 'admin'), (req, res) => {
  const lab = db.prepare('SELECT * FROM labs WHERE id = ?').get(req.params.id);
  if (!lab) return res.status(404).json({ error: 'Lab not found' });

  if (req.user.role === 'lab' && lab.user_id !== req.user.id) {
    return res.status(403).json({ error: 'Cannot edit another lab\'s profile' });
  }

  const { name, description, location, services_json, price_per_day, availability_json } = req.body;

  db.prepare(`
    UPDATE labs SET
      name = COALESCE(?, name),
      description = COALESCE(?, description),
      location = COALESCE(?, location),
      services_json = COALESCE(?, services_json),
      price_per_day = COALESCE(?, price_per_day),
      availability_json = COALESCE(?, availability_json)
    WHERE id = ?
  `).run(
    name ?? null,
    description ?? null,
    location ?? null,
    services_json ? JSON.stringify(services_json) : null,
    price_per_day ?? null,
    availability_json ? JSON.stringify(availability_json) : null,
    req.params.id
  );

  const updated = db.prepare('SELECT * FROM labs WHERE id = ?').get(req.params.id);
  updated.services_json = JSON.parse(updated.services_json || '[]');
  updated.availability_json = JSON.parse(updated.availability_json || '{}');

  res.json(updated);
});

module.exports = router;
