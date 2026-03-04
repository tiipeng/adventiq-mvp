const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../db/database');
const { authenticate, requireRole, requireApproved } = require('../middleware/auth');

const router = express.Router();

// ─── AI Placeholder ───────────────────────────────────────────────────────────
/**
 * TODO: AI Integration Point
 * generateAIReport(bookingId) — uses LLM to generate a structured consultation
 * report based on the booking's problem description, expert profile, and
 * session notes. Saves result as a draft for expert review.
 */
async function generateAIReport(bookingId) {
  console.log(`[AI Placeholder] generateAIReport called for booking ${bookingId}`);
  return {
    content: '# AI-Generated Report Draft\n\n_AI report generation not yet implemented._',
  };
}

// ─── Multer config ─────────────────────────────────────────────────────────────
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `report-${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.docx', '.txt', '.md', '.xlsx'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

// ─── POST /api/reports ─────────────────────────────────────────────────────────
router.post('/', authenticate, requireApproved, requireRole('expert', 'lab'), upload.single('file'), (req, res) => {
  const { booking_id, content } = req.body;

  if (!booking_id) {
    return res.status(400).json({ error: 'booking_id is required' });
  }

  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(booking_id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  // Verify this expert/lab owns the booking
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

  const file_path = req.file ? `/uploads/${req.file.filename}` : null;

  // Upsert report (one per booking)
  const existing = db.prepare('SELECT id FROM reports WHERE booking_id = ?').get(booking_id);
  if (existing) {
    db.prepare('UPDATE reports SET content = ?, file_path = COALESCE(?, file_path), submitted_at = datetime(\'now\') WHERE booking_id = ?')
      .run(content || null, file_path, booking_id);
  } else {
    db.prepare('INSERT INTO reports (booking_id, content, file_path) VALUES (?, ?, ?)').run(booking_id, content || null, file_path);
  }

  // Mark booking as completed when report is submitted
  db.prepare('UPDATE bookings SET status = \'completed\' WHERE id = ? AND status != \'completed\'').run(booking_id);

  const report = db.prepare('SELECT * FROM reports WHERE booking_id = ?').get(booking_id);
  res.status(201).json(report);
});

// ─── GET /api/reports/booking/:booking_id ─────────────────────────────────────
router.get('/booking/:booking_id', authenticate, requireApproved, (req, res) => {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(req.params.booking_id);
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

  const report = db.prepare('SELECT * FROM reports WHERE booking_id = ?').get(req.params.booking_id);
  if (!report) return res.status(404).json({ error: 'No report yet for this booking' });

  res.json(report);
});

module.exports = router;
