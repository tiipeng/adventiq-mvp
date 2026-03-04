/**
 * Seed script — populates the database with realistic mock data.
 * Run with: npm run seed  (from server/) or: npm run seed (from root)
 */

const bcrypt = require('bcryptjs');
const db = require('./database');

console.log('🌱 Seeding AdventIQ database...\n');

// ─── Clear existing data ────────────────────────────────────────────────────
db.exec(`
  DELETE FROM reports;
  DELETE FROM bookings;
  DELETE FROM experts;
  DELETE FROM labs;
  DELETE FROM users;
`);

const SALT = 10;

// ─── Helper ─────────────────────────────────────────────────────────────────
function createUser({ name, email, password, role, status = 'approved' }) {
  const hash = bcrypt.hashSync(password, SALT);
  const stmt = db.prepare(`
    INSERT INTO users (name, email, password_hash, role, status)
    VALUES (@name, @email, @hash, @role, @status)
  `);
  const result = stmt.run({ name, email, hash, role, status });
  return result.lastInsertRowid;
}

// ─── Admin ───────────────────────────────────────────────────────────────────
const adminId = createUser({
  name: 'AdventIQ Admin',
  email: 'admin@adventiq.com',
  password: 'Admin123!',
  role: 'admin',
  status: 'approved',
});
console.log(`✅ Admin created: admin@adventiq.com`);

// ─── Business Users ──────────────────────────────────────────────────────────
const annaId = createUser({
  name: 'Anna Schmidt',
  email: 'anna.schmidt@techcorp.de',
  password: 'Business123!',
  role: 'business',
  status: 'approved',
});

const janId = createUser({
  name: 'Jan Kowalski',
  email: 'jan.kowalski@innovate.pl',
  password: 'Business123!',
  role: 'business',
  status: 'approved',
});
console.log(`✅ Business users created: anna.schmidt@techcorp.de, jan.kowalski@innovate.pl`);

// ─── Experts ─────────────────────────────────────────────────────────────────
const muellerId = createUser({
  name: 'Dr. Klaus Müller',
  email: 'dr.mueller@university.de',
  password: 'Expert123!',
  role: 'expert',
  status: 'approved',
});

const availability2024 = JSON.stringify({
  '2025-03-10': ['09:00', '10:00', '11:00', '14:00', '15:00'],
  '2025-03-11': ['09:00', '10:00', '13:00', '14:00'],
  '2025-03-12': ['10:00', '11:00', '15:00', '16:00'],
  '2025-03-17': ['09:00', '10:00', '11:00', '14:00'],
  '2025-03-18': ['13:00', '14:00', '15:00'],
  '2026-03-10': ['09:00', '10:00', '11:00', '14:00', '15:00'],
  '2026-03-11': ['09:00', '10:00', '13:00', '14:00'],
  '2026-03-12': ['10:00', '11:00', '15:00', '16:00'],
  '2026-03-17': ['09:00', '10:00', '11:00', '14:00'],
  '2026-03-18': ['13:00', '14:00', '15:00'],
  '2026-03-24': ['09:00', '10:00', '11:00'],
  '2026-03-25': ['14:00', '15:00', '16:00'],
});

db.prepare(`
  INSERT INTO experts (user_id, bio, expertise_tags, location, hourly_rate, availability_json, rating, reviews_count)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  muellerId,
  'Experienced AI & Machine Learning researcher with 15+ years in industry consulting. Specialises in NLP, computer vision, and production ML systems. Previously at Siemens and BMW.',
  JSON.stringify(['Machine Learning', 'NLP', 'Computer Vision', 'Python', 'TensorFlow']),
  'Munich, Germany',
  250,
  availability2024,
  4.9,
  47
);

const nowakId = createUser({
  name: 'Prof. Agnieszka Nowak',
  email: 'prof.nowak@warsaw-uni.pl',
  password: 'Expert123!',
  role: 'expert',
  status: 'approved',
});

db.prepare(`
  INSERT INTO experts (user_id, bio, expertise_tags, location, hourly_rate, availability_json, rating, reviews_count)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  nowakId,
  'Professor of Biomedical Engineering at Warsaw University of Technology. Expert in medical device regulatory compliance (CE marking, FDA), and clinical trial design.',
  JSON.stringify(['Biomedical Engineering', 'Regulatory Compliance', 'CE Marking', 'Clinical Trials', 'ISO 13485']),
  'Warsaw, Poland',
  180,
  JSON.stringify({
    '2026-03-09': ['10:00', '11:00', '12:00'],
    '2026-03-10': ['09:00', '13:00', '14:00'],
    '2026-03-16': ['10:00', '11:00', '14:00', '15:00'],
    '2026-03-23': ['09:00', '10:00', '15:00'],
  }),
  4.7,
  32
);

const chenId = createUser({
  name: 'Dr. Wei Chen',
  email: 'dr.chen@fraunhofer.de',
  password: 'Expert123!',
  role: 'expert',
  status: 'approved',
});

db.prepare(`
  INSERT INTO experts (user_id, bio, expertise_tags, location, hourly_rate, availability_json, rating, reviews_count)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  chenId,
  'Senior researcher at Fraunhofer Institute specialising in sustainable materials and manufacturing processes. Deep expertise in lifecycle assessment and circular economy implementation.',
  JSON.stringify(['Sustainability', 'Materials Science', 'Circular Economy', 'LCA', 'Green Manufacturing']),
  'Berlin, Germany',
  200,
  JSON.stringify({
    '2026-03-11': ['09:00', '10:00', '11:00', '13:00'],
    '2026-03-12': ['14:00', '15:00', '16:00'],
    '2026-03-18': ['09:00', '10:00', '13:00', '14:00'],
    '2026-03-25': ['10:00', '11:00', '15:00', '16:00'],
  }),
  4.8,
  28
);

console.log(`✅ Experts created: dr.mueller, prof.nowak, dr.chen`);

// ─── Labs ────────────────────────────────────────────────────────────────────
const cleanroomUserId = createUser({
  name: 'TUM Cleanroom Facility',
  email: 'cleanroom@tum.de',
  password: 'Lab123!',
  role: 'lab',
  status: 'approved',
});

db.prepare(`
  INSERT INTO labs (user_id, name, description, location, services_json, price_per_day, availability_json, rating, reviews_count)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  cleanroomUserId,
  'TUM Cleanroom Facility (ISO Class 5)',
  'State-of-the-art ISO Class 5 cleanroom at Technical University of Munich. Equipped for semiconductor fabrication, MEMS development, and nano-patterning. Full technical staff support available.',
  'Munich, Germany',
  JSON.stringify([
    'Semiconductor Fabrication',
    'MEMS Development',
    'Nano-patterning',
    'Electron Beam Lithography',
    'Thin Film Deposition',
    'Cleanroom Training',
  ]),
  1500,
  JSON.stringify({
    '2026-03-09': true,
    '2026-03-10': true,
    '2026-03-16': true,
    '2026-03-17': true,
    '2026-03-23': true,
    '2026-03-24': true,
    '2026-03-30': true,
    '2026-03-31': true,
  }),
  4.6,
  19
);

const biotechUserId = createUser({
  name: 'UW Biotech Lab',
  email: 'biotech.lab@uw.edu.pl',
  password: 'Lab123!',
  role: 'lab',
  status: 'approved',
});

db.prepare(`
  INSERT INTO labs (user_id, name, description, location, services_json, price_per_day, availability_json, rating, reviews_count)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  biotechUserId,
  'University of Warsaw Biotechnology Lab',
  'Advanced biotechnology facility offering protein analysis, cell culture, genomics and proteomics services. BSL-2 certified. Available for external companies via rental agreement.',
  'Warsaw, Poland',
  JSON.stringify([
    'Protein Analysis',
    'Cell Culture',
    'Next-Gen Sequencing',
    'CRISPR Research',
    'Flow Cytometry',
    'Mass Spectrometry',
  ]),
  800,
  JSON.stringify({
    '2026-03-10': true,
    '2026-03-11': true,
    '2026-03-12': true,
    '2026-03-17': true,
    '2026-03-18': true,
    '2026-03-24': true,
    '2026-03-25': true,
  }),
  4.5,
  12
);

console.log(`✅ Labs created: cleanroom@tum.de, biotech.lab@uw.edu.pl`);

// ─── Bookings ─────────────────────────────────────────────────────────────────
// Get expert and lab provider IDs
const mueller = db.prepare('SELECT id FROM experts WHERE user_id = ?').get(muellerId);
const nowak    = db.prepare('SELECT id FROM experts WHERE user_id = ?').get(nowakId);
const cleanroom= db.prepare('SELECT id FROM labs WHERE user_id = ?').get(cleanroomUserId);

const b1 = db.prepare(`
  INSERT INTO bookings (business_user_id, provider_id, provider_type, slot_start, slot_end, status, problem_description, total_price)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  annaId, mueller.id, 'expert',
  '2026-02-15 10:00:00', '2026-02-15 11:00:00',
  'completed',
  'We need to evaluate whether our current data pipeline can support a real-time recommendation engine. Looking for architecture advice and a feasibility report.',
  250
).lastInsertRowid;

const b2 = db.prepare(`
  INSERT INTO bookings (business_user_id, provider_id, provider_type, slot_start, slot_end, status, problem_description, total_price)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  janId, nowak.id, 'expert',
  '2026-03-05 13:00:00', '2026-03-05 14:00:00',
  'confirmed',
  'Seeking regulatory guidance for CE marking of our new cardiac monitoring wearable device targeting the EU market.',
  180
).lastInsertRowid;

const b3 = db.prepare(`
  INSERT INTO bookings (business_user_id, provider_id, provider_type, slot_start, slot_end, status, problem_description, total_price)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  annaId, cleanroom.id, 'lab',
  '2026-03-10 00:00:00', '2026-03-11 23:59:59',
  'pending',
  'Need access to ISO Class 5 cleanroom for prototype semiconductor sensor fabrication. Our team of 2 engineers will need full-day access for 2 days.',
  3000
).lastInsertRowid;

console.log(`✅ Bookings created (3 bookings)`);

// ─── Reports ─────────────────────────────────────────────────────────────────
db.prepare(`
  INSERT INTO reports (booking_id, content, submitted_at)
  VALUES (?, ?, ?)
`).run(
  b1,
  `# Feasibility Assessment: Real-Time Recommendation Engine

## Executive Summary
After reviewing TechCorp's current data infrastructure, I find the existing pipeline **partially ready** for real-time recommendations with targeted upgrades.

## Current State Analysis
- Data ingestion: Apache Kafka (adequate)
- Processing: Batch-oriented (needs change)
- Storage: PostgreSQL + S3 (adequate)
- ML Serving: None (gap)

## Recommendations

### Short Term (1–3 months)
1. Introduce a feature store (Feast or Tecton)
2. Deploy a lightweight model serving layer (FastAPI + Redis)
3. Implement A/B testing framework

### Medium Term (3–6 months)
1. Migrate batch jobs to streaming with Flink
2. Evaluate Vertex AI or SageMaker for managed MLOps
3. Build feedback loop for online learning

## Estimated Investment
- Engineering: 3 FTE × 4 months
- Infrastructure: ~€2,400/month additional cloud spend

## Conclusion
The project is technically feasible with a 6-month horizon. I recommend starting with the short-term items to demonstrate quick wins.

*Report prepared by Dr. Klaus Müller, 15 February 2026*`,
  '2026-02-15 12:00:00'
);

console.log(`✅ Reports created (1 completed report)`);

console.log('\n🎉 Seed complete! AdventIQ database is ready.\n');
console.log('Login credentials:');
console.log('  Admin:    admin@adventiq.com        / Admin123!');
console.log('  Business: anna.schmidt@techcorp.de  / Business123!');
console.log('  Business: jan.kowalski@innovate.pl  / Business123!');
console.log('  Expert:   dr.mueller@university.de  / Expert123!');
console.log('  Expert:   prof.nowak@warsaw-uni.pl  / Expert123!');
console.log('  Expert:   dr.chen@fraunhofer.de     / Expert123!');
console.log('  Lab:      cleanroom@tum.de           / Lab123!');
console.log('  Lab:      biotech.lab@uw.edu.pl      / Lab123!\n');

db.close();
