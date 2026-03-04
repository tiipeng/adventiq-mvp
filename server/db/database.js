const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

const DB_PATH = path.join(__dirname, '..', 'data', 'adventiq.db');

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(DB_PATH);

// Enable WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ─── Schema ────────────────────────────────────────────────────────────────

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT    NOT NULL,
    email       TEXT    NOT NULL UNIQUE,
    password_hash TEXT  NOT NULL,
    role        TEXT    NOT NULL CHECK(role IN ('business','expert','lab','admin')),
    status      TEXT    NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','approved','rejected')),
    created_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS experts (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id         INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    bio             TEXT,
    expertise_tags  TEXT    DEFAULT '[]',
    location        TEXT,
    hourly_rate     REAL    DEFAULT 0,
    availability_json TEXT  DEFAULT '{}',
    rating          REAL    DEFAULT 0,
    reviews_count   INTEGER DEFAULT 0,
    publications    INTEGER DEFAULT 0,
    patents         INTEGER DEFAULT 0,
    industry_projects INTEGER DEFAULT 0,
    avg_response_time TEXT  DEFAULT '24h',
    success_rate    REAL    DEFAULT 0,
    industry_ready_score REAL DEFAULT 0,
    verified        INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS labs (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id           INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    name              TEXT,
    description       TEXT,
    location          TEXT,
    services_json     TEXT    DEFAULT '[]',
    price_per_day     REAL    DEFAULT 0,
    availability_json TEXT    DEFAULT '{}',
    rating            REAL    DEFAULT 0,
    reviews_count     INTEGER DEFAULT 0,
    certifications_json TEXT  DEFAULT '[]',
    equipment_json    TEXT    DEFAULT '[]',
    lat               REAL,
    lng               REAL,
    city              TEXT,
    hourly_rate       REAL    DEFAULT 0,
    half_day_rate     REAL    DEFAULT 0,
    capacity          INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    business_user_id    INTEGER NOT NULL REFERENCES users(id),
    provider_id         INTEGER NOT NULL,
    provider_type       TEXT    NOT NULL CHECK(provider_type IN ('expert','lab')),
    slot_start          TEXT    NOT NULL,
    slot_end            TEXT    NOT NULL,
    status              TEXT    NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','confirmed','rejected','completed','cancelled')),
    problem_description TEXT,
    payment_intent_id   TEXT,
    total_price         REAL    DEFAULT 0,
    created_at          TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reports (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id    INTEGER NOT NULL UNIQUE REFERENCES bookings(id),
    content       TEXT,
    file_path     TEXT,
    submitted_at  TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS async_consultations (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    business_user_id INTEGER NOT NULL REFERENCES users(id),
    expert_id        INTEGER NOT NULL REFERENCES experts(id),
    question         TEXT    NOT NULL,
    sla_hours        INTEGER NOT NULL DEFAULT 48,
    price            REAL    NOT NULL DEFAULT 80,
    status           TEXT    NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','answered','archived')),
    answer           TEXT,
    ai_draft         TEXT,
    payment_intent_id TEXT,
    created_at       TEXT    NOT NULL DEFAULT (datetime('now')),
    answered_at      TEXT
  );

  CREATE TABLE IF NOT EXISTS follow_up_suggestions (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    business_user_id INTEGER NOT NULL REFERENCES users(id),
    trigger_booking_id INTEGER REFERENCES bookings(id),
    suggestion_type  TEXT    NOT NULL CHECK(suggestion_type IN ('expert','lab','package')),
    suggestion_id    INTEGER NOT NULL,
    confidence_score INTEGER NOT NULL DEFAULT 80,
    reason           TEXT,
    created_at       TEXT    NOT NULL DEFAULT (datetime('now'))
  );
`);

// ─── Migrations: add new columns to existing tables if they don't exist ──────
const expertCols = ['publications', 'patents', 'industry_projects', 'avg_response_time', 'success_rate', 'industry_ready_score', 'verified'];
const expertDefs = ['INTEGER DEFAULT 0', 'INTEGER DEFAULT 0', 'INTEGER DEFAULT 0', "TEXT DEFAULT '24h'", 'REAL DEFAULT 0', 'REAL DEFAULT 0', 'INTEGER DEFAULT 0'];
expertCols.forEach((col, i) => {
  try { db.exec(`ALTER TABLE experts ADD COLUMN ${col} ${expertDefs[i]}`); } catch (_) {}
});

const labCols = ['certifications_json', 'equipment_json', 'lat', 'lng', 'city', 'hourly_rate', 'half_day_rate', 'capacity'];
const labDefs = ["TEXT DEFAULT '[]'", "TEXT DEFAULT '[]'", 'REAL', 'REAL', 'TEXT', 'REAL DEFAULT 0', 'REAL DEFAULT 0', 'INTEGER DEFAULT 0'];
labCols.forEach((col, i) => {
  try { db.exec(`ALTER TABLE labs ADD COLUMN ${col} ${labDefs[i]}`); } catch (_) {}
});

module.exports = db;
