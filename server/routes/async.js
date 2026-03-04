const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { authenticate, requireApproved } = require('../middleware/auth');

// ─── POST /api/async — create async consultation (business only) ──────────────
router.post('/', authenticate, requireApproved, (req, res) => {
  if (req.user.role !== 'business') return res.status(403).json({ error: 'Business accounts only' });

  const { expert_id, question, sla_hours } = req.body;
  if (!expert_id || !question?.trim()) return res.status(400).json({ error: 'expert_id and question required' });

  const sla = sla_hours === 24 ? 24 : 48;
  const price = sla === 24 ? 120 : 80;

  // Verify expert exists
  const expert = db.prepare('SELECT id FROM experts WHERE id = ?').get(expert_id);
  if (!expert) return res.status(404).json({ error: 'Expert not found' });

  // Simple AI draft (mock) based on question keywords
  const aiDraft = generateAIDraft(question);

  const result = db.prepare(`
    INSERT INTO async_consultations (business_user_id, expert_id, question, sla_hours, price, ai_draft)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(req.user.id, expert_id, question.trim(), sla, price, aiDraft);

  const consultation = db.prepare(`
    SELECT ac.*, u.name AS business_name, eu.name AS expert_name
    FROM async_consultations ac
    JOIN users u ON u.id = ac.business_user_id
    JOIN experts e ON e.id = ac.expert_id
    JOIN users eu ON eu.id = e.user_id
    WHERE ac.id = ?
  `).get(result.lastInsertRowid);

  res.status(201).json(consultation);
});

// ─── GET /api/async — list consultations (scoped by role) ─────────────────────
router.get('/', authenticate, requireApproved, (req, res) => {
  let rows;

  if (req.user.role === 'business') {
    rows = db.prepare(`
      SELECT ac.*, eu.name AS expert_name, e.location AS expert_location, e.hourly_rate
      FROM async_consultations ac
      JOIN experts e ON e.id = ac.expert_id
      JOIN users eu ON eu.id = e.user_id
      WHERE ac.business_user_id = ?
      ORDER BY ac.created_at DESC
    `).all(req.user.id);

  } else if (req.user.role === 'expert') {
    const expert = db.prepare('SELECT id FROM experts WHERE user_id = ?').get(req.user.id);
    if (!expert) return res.json([]);
    rows = db.prepare(`
      SELECT ac.*, u.name AS business_name, u.email AS business_email
      FROM async_consultations ac
      JOIN users u ON u.id = ac.business_user_id
      WHERE ac.expert_id = ?
      ORDER BY ac.created_at DESC
    `).all(expert.id);

  } else if (req.user.role === 'admin') {
    rows = db.prepare(`
      SELECT ac.*, u.name AS business_name, eu.name AS expert_name
      FROM async_consultations ac
      JOIN users u ON u.id = ac.business_user_id
      JOIN experts e ON e.id = ac.expert_id
      JOIN users eu ON eu.id = e.user_id
      ORDER BY ac.created_at DESC
    `).all();
  } else {
    return res.json([]);
  }

  res.json(rows);
});

// ─── GET /api/async/:id — get single consultation ─────────────────────────────
router.get('/:id', authenticate, requireApproved, (req, res) => {
  const row = db.prepare(`
    SELECT ac.*, u.name AS business_name, eu.name AS expert_name,
           e.hourly_rate, e.location AS expert_location
    FROM async_consultations ac
    JOIN users u ON u.id = ac.business_user_id
    JOIN experts e ON e.id = ac.expert_id
    JOIN users eu ON eu.id = e.user_id
    WHERE ac.id = ?
  `).get(req.params.id);

  if (!row) return res.status(404).json({ error: 'Consultation not found' });

  // Access control
  if (req.user.role === 'business' && row.business_user_id !== req.user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }
  if (req.user.role === 'expert') {
    const expert = db.prepare('SELECT id FROM experts WHERE user_id = ?').get(req.user.id);
    if (!expert || row.expert_id !== expert.id) return res.status(403).json({ error: 'Forbidden' });
  }

  res.json(row);
});

// ─── PUT /api/async/:id/answer — expert submits answer ───────────────────────
router.put('/:id/answer', authenticate, requireApproved, (req, res) => {
  if (req.user.role !== 'expert') return res.status(403).json({ error: 'Expert accounts only' });

  const expert = db.prepare('SELECT id FROM experts WHERE user_id = ?').get(req.user.id);
  if (!expert) return res.status(404).json({ error: 'Expert profile not found' });

  const row = db.prepare('SELECT * FROM async_consultations WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Consultation not found' });
  if (row.expert_id !== expert.id) return res.status(403).json({ error: 'Forbidden' });
  if (row.status === 'answered') return res.status(400).json({ error: 'Already answered' });

  const { answer } = req.body;
  if (!answer?.trim()) return res.status(400).json({ error: 'answer required' });

  db.prepare(`
    UPDATE async_consultations
    SET answer = ?, status = 'answered', answered_at = datetime('now')
    WHERE id = ?
  `).run(answer.trim(), req.params.id);

  res.json({ success: true });
});

// ─── PUT /api/async/:id/archive — archive consultation ────────────────────────
router.put('/:id/archive', authenticate, requireApproved, (req, res) => {
  const row = db.prepare('SELECT * FROM async_consultations WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ error: 'Not found' });
  if (req.user.role === 'business' && row.business_user_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

  db.prepare("UPDATE async_consultations SET status = 'archived' WHERE id = ?").run(req.params.id);
  res.json({ success: true });
});

// ─── AI Draft generator (mock) ────────────────────────────────────────────────
function generateAIDraft(question) {
  const q = question.toLowerCase();
  if (q.includes('ml') || q.includes('machine learning') || q.includes('ai') || q.includes('neural')) {
    return `Based on your question about ML/AI, here is a suggested response draft:\n\nI recommend starting with a clear problem definition and data audit before selecting a model architecture. Key considerations: data quality (typically 80% of ML success), choice of framework (PyTorch for research flexibility, TensorFlow/Keras for production deployment), and evaluation metrics aligned with your business KPIs. For production systems, consider MLflow for experiment tracking and FastAPI for model serving.`;
  }
  if (q.includes('regulat') || q.includes('ce mark') || q.includes('fda') || q.includes('compliance')) {
    return `Based on your regulatory compliance question, here is a suggested response draft:\n\nFor EU market entry, the regulatory pathway depends on device classification (Class I/IIa/IIb/III under MDR 2017/745). Key steps: technical documentation per Annex II/III, clinical evaluation report (CER), QMS implementation per ISO 13485:2016, and Notified Body engagement for Class IIa+. Budget 12-18 months for Class IIa devices.`;
  }
  if (q.includes('sustainab') || q.includes('carbon') || q.includes('lca') || q.includes('green')) {
    return `Based on your sustainability question, here is a suggested response draft:\n\nI recommend a phased approach: (1) Establish baseline with a Scope 1+2 carbon inventory (ISO 14064), (2) Set SBTi-aligned targets, (3) Implement quick wins (LED lighting, renewable energy procurement), (4) Address Scope 3 through supplier engagement. For reporting, GRI Standards are the global benchmark; CSRD compliance is mandatory for EU companies >250 employees from 2025.`;
  }
  if (q.includes('biotech') || q.includes('crispr') || q.includes('protein') || q.includes('genomic')) {
    return `Based on your biotechnology question, here is a suggested response draft:\n\nKey considerations for your biotech application: BSL containment level requirements, IP landscape assessment, and regulatory classification (IVD vs. medicinal product vs. research tool). For CRISPR applications, off-target effect characterization is critical for any clinical translation pathway.`;
  }
  return `Based on your question, here is a suggested response draft:\n\nThank you for the detailed question. Based on my expertise, I recommend starting with a structured assessment of your current situation before proposing solutions. Key factors to evaluate: (1) technical feasibility given current resources, (2) regulatory and compliance requirements in your target market, (3) timeline and budget constraints, and (4) risk mitigation strategies. I'll provide a comprehensive answer addressing each of these dimensions.`;
}

module.exports = router;
