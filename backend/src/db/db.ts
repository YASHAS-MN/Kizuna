import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configurable DB location, default to data/kizuna.db relative to backend root
const DB_PATH = process.env.DATABASE_PATH || path.resolve(__dirname, '../../data/kizuna.db');

// Ensure parent data directory exists
const dir = path.dirname(DB_PATH);
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

export const db = new DatabaseSync(DB_PATH);

// Enforce foreign key constraints
db.exec('PRAGMA foreign_keys = ON');

/**
 * Initializes the database schema and seeds developer data if empty.
 */
export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL CHECK(role IN ('STUDENT', 'MENTOR', 'STAFF', 'ADMIN')),
      password_hash TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS team_members (
      team_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      membership_role TEXT NOT NULL,
      PRIMARY KEY (team_id, user_id),
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS projects (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL CHECK(status IN ('PLANNING', 'ACTIVE', 'COMPLETED', 'ARCHIVED')),
      team_id TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
    );
  `);

  // Seeding check: query row count in users table
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
  if (userCount && userCount.count === 0) {
    console.log('Seeding SQLite database...');
    
    // Seed Users (Scrypt hash for "kizuna123")
    const devPasswordHash = 'd81a94bb2e6f47738ef9e18b449ff1b3:d0876f953d5f530c1db0cdb5e45a7bf4f513e5f9c80b5bead4ce562fb79aae4566a6a5e88cd1f3900aa7e18b71f829ab5d793aa3dc6c49c878312d78b3b26bd9';
    
    const insertUser = db.prepare('INSERT INTO users (id, name, email, role, password_hash) VALUES (?, ?, ?, ?, ?)');
    insertUser.run('u1', 'Alice Watson', 'alice@kizuna.edu', 'STUDENT', devPasswordHash);
    insertUser.run('u2', 'Bob Jenkins', 'bob@kizuna.edu', 'STUDENT', devPasswordHash);
    insertUser.run('u3', 'Charlie Kim', 'charlie@kizuna.edu', 'STUDENT', devPasswordHash);
    insertUser.run('u4', 'Dr. Sarah Jenkins', 'sarah.jenkins@kizuna.edu', 'MENTOR', devPasswordHash);
    insertUser.run('u5', 'Prof. Alan Vance', 'alan.vance@kizuna.edu', 'MENTOR', devPasswordHash);
    insertUser.run('u6', 'Marcus Chen', 'marcus.chen@kizuna.edu', 'STAFF', devPasswordHash);
    insertUser.run('u7', 'Yashas Admin', 'admin@kizuna.edu', 'ADMIN', devPasswordHash);
    insertUser.run('u8', 'David Smith', 'david@kizuna.edu', 'STUDENT', devPasswordHash);
    insertUser.run('u9', 'Elena Rostova', 'elena@kizuna.edu', 'STUDENT', devPasswordHash);

    // Seed Teams
    const insertTeam = db.prepare('INSERT INTO teams (id, name, created_at) VALUES (?, ?, ?)');
    insertTeam.run('t1', 'Team Alpha', '2026-08-01T00:00:00.000Z');
    insertTeam.run('t2', 'Team Beta', '2026-08-05T00:00:00.000Z');

    // Seed Memberships
    const insertMember = db.prepare('INSERT INTO team_members (team_id, user_id, membership_role) VALUES (?, ?, ?)');
    insertMember.run('t1', 'u1', 'Lead Frontend Developer');
    insertMember.run('t1', 'u2', 'UI Designer');
    insertMember.run('t1', 'u3', 'QA Tester');
    insertMember.run('t2', 'u8', 'Machine Learning Lead');
    insertMember.run('t2', 'u9', 'Full Stack Engineer');

    // Seed Projects
    const insertProject = db.prepare('INSERT INTO projects (id, name, description, status, team_id, created_at) VALUES (?, ?, ?, ?, ?, ?)');
    insertProject.run('p1', 'Kizuna Platform Foundation', 'Initial scaffolding and structural styling for the student collaborative ecosystem.', 'ACTIVE', 't1', '2026-08-10T00:00:00.000Z');
    insertProject.run('p2', 'AI-Powered Resume Analyzer', 'An AI-driven parsing assistant that checks resume alignment with tech job descriptions.', 'PLANNING', 't2', '2026-08-12T00:00:00.000Z');
    
    console.log('SQLite database seeded successfully.');
  } else {
    console.log('SQLite database already populated. Seeding skipped.');
  }
}
