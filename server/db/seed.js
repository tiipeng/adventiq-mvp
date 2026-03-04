/**
 * Seed script — populates the database with realistic mock data.
 * Run with: npm run seed  (from server/) or: npm run seed (from root)
 */

const bcrypt = require('bcryptjs');
const db = require('./database');

console.log('🌱 Seeding AdventIQ database...\n');

// ─── Clear existing data ────────────────────────────────────────────────────
db.exec(`
  DELETE FROM follow_up_suggestions;
  DELETE FROM async_consultations;
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

const expertAvail1 = JSON.stringify({
  '2026-03-10': ['09:00', '10:00', '11:00', '14:00', '15:00'],
  '2026-03-11': ['09:00', '10:00', '13:00', '14:00'],
  '2026-03-12': ['10:00', '11:00', '15:00', '16:00'],
  '2026-03-17': ['09:00', '10:00', '11:00', '14:00'],
  '2026-03-18': ['13:00', '14:00', '15:00'],
  '2026-03-24': ['09:00', '10:00', '11:00'],
  '2026-03-25': ['14:00', '15:00', '16:00'],
});

const muellerExpert = db.prepare(`
  INSERT INTO experts (user_id, bio, expertise_tags, location, hourly_rate, availability_json, rating, reviews_count,
    publications, patents, industry_projects, avg_response_time, success_rate, industry_ready_score, verified)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  muellerId,
  'Experienced AI & Machine Learning researcher with 15+ years in industry consulting. Specialises in NLP, computer vision, and production ML systems. Previously at Siemens and BMW.',
  JSON.stringify(['Machine Learning', 'NLP', 'Computer Vision', 'Python', 'TensorFlow']),
  'Munich, Germany',
  250, expertAvail1, 4.9, 47,
  23, 3, 45, '2h', 97, 9.2, 1
);

const nowakId = createUser({
  name: 'Prof. Agnieszka Nowak',
  email: 'prof.nowak@warsaw-uni.pl',
  password: 'Expert123!',
  role: 'expert',
  status: 'approved',
});

const nowakExpert = db.prepare(`
  INSERT INTO experts (user_id, bio, expertise_tags, location, hourly_rate, availability_json, rating, reviews_count,
    publications, patents, industry_projects, avg_response_time, success_rate, industry_ready_score, verified)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
  4.7, 32,
  18, 1, 28, '4h', 94, 8.7, 1
);

const chenId = createUser({
  name: 'Dr. Wei Chen',
  email: 'dr.chen@fraunhofer.de',
  password: 'Expert123!',
  role: 'expert',
  status: 'approved',
});

const chenExpert = db.prepare(`
  INSERT INTO experts (user_id, bio, expertise_tags, location, hourly_rate, availability_json, rating, reviews_count,
    publications, patents, industry_projects, avg_response_time, success_rate, industry_ready_score, verified)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
  4.8, 28,
  31, 5, 52, '1h', 98, 9.5, 1
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
  INSERT INTO labs (user_id, name, description, location, services_json, price_per_day, availability_json, rating, reviews_count,
    certifications_json, equipment_json, lat, lng, city, hourly_rate, half_day_rate, capacity)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  cleanroomUserId,
  'TUM Cleanroom Facility (ISO Class 5)',
  'State-of-the-art ISO Class 5 cleanroom at Technical University of Munich. Equipped for semiconductor fabrication, MEMS development, and nano-patterning. Full technical staff support available.',
  'Munich, Germany',
  JSON.stringify(['Semiconductor Fabrication', 'MEMS Development', 'Nano-patterning', 'Electron Beam Lithography', 'Thin Film Deposition', 'Cleanroom Training']),
  1500,
  JSON.stringify({
    '2026-03-09': true, '2026-03-10': true, '2026-03-16': true,
    '2026-03-17': true, '2026-03-23': true, '2026-03-24': true,
    '2026-03-30': true, '2026-03-31': true,
  }),
  4.6, 19,
  JSON.stringify(['ISO Class 5', 'CE Certified', 'DIN EN ISO 14644', 'SEMI S2']),
  JSON.stringify(['Electron Beam Lithography', 'PECVD System', 'RF Sputtering', 'Optical Lithography', 'Reactive Ion Etcher', 'Profilometer']),
  48.1497, 11.5685, 'Munich',
  200, 700, 8
);

const biotechUserId = createUser({
  name: 'UW Biotech Lab',
  email: 'biotech.lab@uw.edu.pl',
  password: 'Lab123!',
  role: 'lab',
  status: 'approved',
});

db.prepare(`
  INSERT INTO labs (user_id, name, description, location, services_json, price_per_day, availability_json, rating, reviews_count,
    certifications_json, equipment_json, lat, lng, city, hourly_rate, half_day_rate, capacity)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  biotechUserId,
  'University of Warsaw Biotechnology Lab',
  'Advanced biotechnology facility offering protein analysis, cell culture, genomics and proteomics services. BSL-2 certified. Available for external companies via rental agreement.',
  'Warsaw, Poland',
  JSON.stringify(['Protein Analysis', 'Cell Culture', 'Next-Gen Sequencing', 'CRISPR Research', 'Flow Cytometry', 'Mass Spectrometry']),
  800,
  JSON.stringify({
    '2026-03-10': true, '2026-03-11': true, '2026-03-12': true,
    '2026-03-17': true, '2026-03-18': true, '2026-03-24': true, '2026-03-25': true,
  }),
  4.5, 12,
  JSON.stringify(['BSL-2 Certified', 'ISO 9001', 'GMP-Ready', 'PCA Accredited']),
  JSON.stringify(['Flow Cytometer (BD FACSAria)', 'Mass Spectrometer', 'NGS Platform (Illumina)', 'CRISPR Toolkit', 'Confocal Microscope', 'Ultracentrifuge']),
  52.2298, 21.0118, 'Warsaw',
  120, 450, 12
);

// ─── Lab 3: Fraunhofer ENAS Dresden ──────────────────────────────────────────
const enasUserId = createUser({
  name: 'Fraunhofer ENAS Lab',
  email: 'nanotech@fraunhofer-enas.de',
  password: 'Lab123!',
  role: 'lab',
  status: 'approved',
});

db.prepare(`
  INSERT INTO labs (user_id, name, description, location, services_json, price_per_day, availability_json, rating, reviews_count,
    certifications_json, equipment_json, lat, lng, city, hourly_rate, half_day_rate, capacity)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  enasUserId,
  'Fraunhofer ENAS Nanotech Lab',
  'Leading research facility at Fraunhofer Institute for Electronic Nano Systems in Dresden. Specializing in MEMS fabrication, sensor development, and nano-characterization for industry partners.',
  'Dresden, Germany',
  JSON.stringify(['MEMS Fabrication', 'Nano-characterization', 'Sensor Development', 'Reliability Testing', 'Package Integration', 'Material Analysis']),
  1200,
  JSON.stringify({
    '2026-03-10': true, '2026-03-12': true, '2026-03-13': true,
    '2026-03-19': true, '2026-03-20': true, '2026-03-26': true, '2026-03-27': true,
  }),
  4.8, 24,
  JSON.stringify(['ISO 9001:2015', 'ISO/IEC 17025', 'SEMI S2', 'CE Marked']),
  JSON.stringify(['SEM/EDX System', 'Atomic Force Microscope', 'Wire Bonder', 'Flip-Chip Bonder', 'Wafer Prober', 'Laser Processing Center']),
  51.0504, 13.7373, 'Dresden',
  160, 580, 6
);

// ─── Lab 4: AGH Nanotech Kraków ───────────────────────────────────────────────
const aghUserId = createUser({
  name: 'AGH Nanotechnology Center',
  email: 'nanotech@agh.edu.pl',
  password: 'Lab123!',
  role: 'lab',
  status: 'approved',
});

db.prepare(`
  INSERT INTO labs (user_id, name, description, location, services_json, price_per_day, availability_json, rating, reviews_count,
    certifications_json, equipment_json, lat, lng, city, hourly_rate, half_day_rate, capacity)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  aghUserId,
  'AGH Nanotechnology Center',
  'Full-service nanotechnology center at AGH University of Science and Technology in Kraków. Offers nanomaterial synthesis, surface characterization, thin film deposition, and advanced spectroscopy services.',
  'Kraków, Poland',
  JSON.stringify(['Nanomaterial Synthesis', 'Surface Characterization', 'Thin Film Deposition', 'Spectroscopy Analysis', 'Chemical Vapor Deposition', '3D Printing (SLA/FDM)']),
  650,
  JSON.stringify({
    '2026-03-09': true, '2026-03-11': true, '2026-03-16': true,
    '2026-03-18': true, '2026-03-23': true, '2026-03-25': true, '2026-03-30': true,
  }),
  4.4, 16,
  JSON.stringify(['ISO 9001', 'PCA Accreditation', 'REACH Compliant']),
  JSON.stringify(['XRD Diffractometer', 'TEM (Transmission Electron Microscope)', 'Raman Spectrometer', 'Thermal Evaporator', 'Glovebox System', 'ALD Reactor']),
  50.0647, 19.9450, 'Kraków',
  90, 300, 10
);

console.log(`✅ Labs created: TUM Cleanroom, UW Biotech, Fraunhofer ENAS, AGH Nanotech`);

// ─── Bookings ─────────────────────────────────────────────────────────────────
const mueller = db.prepare('SELECT id FROM experts WHERE user_id = ?').get(muellerId);
const nowak   = db.prepare('SELECT id FROM experts WHERE user_id = ?').get(nowakId);
const chen    = db.prepare('SELECT id FROM experts WHERE user_id = ?').get(chenId);
const cleanroom = db.prepare('SELECT id FROM labs WHERE user_id = ?').get(cleanroomUserId);
const biotech   = db.prepare('SELECT id FROM labs WHERE user_id = ?').get(biotechUserId);

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

const b4 = db.prepare(`
  INSERT INTO bookings (business_user_id, provider_id, provider_type, slot_start, slot_end, status, problem_description, total_price)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  janId, biotech.id, 'lab',
  '2026-03-17 00:00:00', '2026-03-17 23:59:59',
  'confirmed',
  'Need BSL-2 certified lab for CRISPR gene editing experiment on bacterial cultures.',
  800
).lastInsertRowid;

console.log(`✅ Bookings created (4 bookings)`);

// ─── Reports ─────────────────────────────────────────────────────────────────
db.prepare(`INSERT INTO reports (booking_id, content, submitted_at) VALUES (?, ?, ?)`).run(
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

// ─── Async Consultations ──────────────────────────────────────────────────────
db.prepare(`
  INSERT INTO async_consultations (business_user_id, expert_id, question, sla_hours, price, status, answer, ai_draft, created_at, answered_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  annaId, mueller.id,
  `Our data science team is considering migrating from a traditional batch ML pipeline to a real-time streaming architecture. We're currently using Spark for batch processing and scikit-learn for model training. The main use case is fraud detection on transaction data (~50k events/minute). What is the recommended architecture for this use case, and what are the key trade-offs between Apache Flink and Apache Kafka Streams for the streaming layer?`,
  24, 120, 'answered',
  `## Architecture Recommendation: Real-Time Fraud Detection

Based on your requirements (50k events/min, fraud detection), I recommend a **Lambda Architecture** with a gradual migration path.

### Recommended Stack
- **Streaming**: Apache Kafka Streams (simpler ops than Flink, sufficient for your throughput)
- **Feature Store**: Redis for real-time features + Feast for feature management
- **Model Serving**: FastAPI + ONNX Runtime for sub-10ms inference
- **Batch Backup**: Keep Spark for model retraining (weekly/monthly)

### Kafka Streams vs Flink Trade-offs
| Aspect | Kafka Streams | Apache Flink |
|--------|--------------|-------------|
| Ops Complexity | Low | High |
| Throughput | Up to 1M/s | 10M+/s |
| State Management | Simple (RocksDB) | Advanced |
| Learning Curve | 2 weeks | 2-3 months |

**For 50k events/min: Kafka Streams is the better fit.**

### Migration Path (12 weeks)
1. Weeks 1-4: Set up Kafka topics, deploy feature store
2. Weeks 5-8: Build streaming pipeline alongside batch
3. Weeks 9-12: Cut over, monitor, decommission batch

*Dr. Klaus Müller — answered within SLA*`,
  `Based on the question about streaming architecture for fraud detection at 50k events/minute, here is a suggested response draft:

Consider Kafka Streams over Apache Flink for your scale — it handles 1M+ events/sec with lower operational complexity. Key components: Kafka for ingestion, Redis for real-time features, FastAPI+ONNX for model serving. Migration should be gradual (parallel run for 4-6 weeks). Main trade-off: Flink offers more advanced state management but requires 3x more ops expertise.`,
  '2026-02-20 09:00:00', '2026-02-20 18:30:00'
);

db.prepare(`
  INSERT INTO async_consultations (business_user_id, expert_id, question, sla_hours, price, status, ai_draft, created_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`).run(
  janId, chen.id,
  `We are a Polish manufacturing SME producing automotive components (steel stamping). We want to submit our first sustainability report and achieve carbon neutrality by 2030. Where do we start? What frameworks should we use (GRI, CSRD, ISO 14001)? And what is a realistic carbon reduction roadmap for a steel-heavy manufacturer?`,
  48, 80, 'pending',
  `For a steel-heavy manufacturer targeting carbon neutrality by 2030, I recommend starting with ISO 14001 certification as the operational foundation, then aligning with GRI Standards for reporting (now mandatory under EU CSRD for companies >250 employees).

Key carbon reduction levers for steel stamping:
1. Energy efficiency (typically 20-30% reduction potential via motor upgrades, heat recovery)
2. Renewable energy procurement (PPAs for electricity)
3. Scope 3 engagement (steel supplier selection based on carbon intensity)
4. Process optimization (reduced scrap, lighter tooling)

Timeline suggestion: ISO 14001 in year 1, GRI baseline report in year 2, 40% absolute reduction by 2027, neutrality via offsets + removals by 2030.`,
  '2026-03-01 14:00:00'
);

console.log(`✅ Async consultations created (2 consultations)`);

// ─── Follow-up Suggestions ────────────────────────────────────────────────────
// After Anna's completed ML booking → suggest sustainability + TUM cleanroom
const cleanroomLab = db.prepare('SELECT id FROM labs WHERE user_id = ?').get(cleanroomUserId);
db.prepare(`
  INSERT INTO follow_up_suggestions (business_user_id, trigger_booking_id, suggestion_type, suggestion_id, confidence_score, reason)
  VALUES (?, ?, ?, ?, ?, ?)
`).run(annaId, b1, 'expert', chen.id, 87, 'Your ML pipeline work often benefits from sustainable infrastructure design — Dr. Chen specializes in green tech systems.');

db.prepare(`
  INSERT INTO follow_up_suggestions (business_user_id, trigger_booking_id, suggestion_type, suggestion_id, confidence_score, reason)
  VALUES (?, ?, ?, ?, ?, ?)
`).run(annaId, b1, 'lab', cleanroomLab.id, 73, 'Hardware prototyping is the next natural step after ML architecture review — TUM Cleanroom offers semiconductor prototyping.');

// After Jan's biotech lab booking → suggest regulatory expert
db.prepare(`
  INSERT INTO follow_up_suggestions (business_user_id, trigger_booking_id, suggestion_type, suggestion_id, confidence_score, reason)
  VALUES (?, ?, ?, ?, ?, ?)
`).run(janId, b4, 'expert', nowak.id, 91, 'CRISPR research outcomes typically require regulatory consultation for CE marking and clinical translation — Prof. Nowak is your best match.');

console.log(`✅ Follow-up suggestions created`);

console.log('\n🎉 Seed complete! AdventIQ database is ready.\n');
console.log('Login credentials:');
console.log('  Admin:    admin@adventiq.com              / Admin123!');
console.log('  Business: anna.schmidt@techcorp.de        / Business123!');
console.log('  Business: jan.kowalski@innovate.pl        / Business123!');
console.log('  Expert:   dr.mueller@university.de        / Expert123!');
console.log('  Expert:   prof.nowak@warsaw-uni.pl        / Expert123!');
console.log('  Expert:   dr.chen@fraunhofer.de           / Expert123!');
console.log('  Lab:      cleanroom@tum.de                / Lab123!');
console.log('  Lab:      biotech.lab@uw.edu.pl           / Lab123!');
console.log('  Lab:      nanotech@fraunhofer-enas.de     / Lab123!');
console.log('  Lab:      nanotech@agh.edu.pl             / Lab123!\n');

db.close();
