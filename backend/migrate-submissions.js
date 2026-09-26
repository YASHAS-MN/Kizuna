import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new DatabaseSync(path.resolve(__dirname, 'data/kizuna.db'));

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS submissions (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      submitted_by TEXT NOT NULL,
      submitted_by_name TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'REVIEWED')),
      version INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      submitted_at TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  console.log('Added submissions table.');

  const insertSubmission = db.prepare('INSERT OR IGNORE INTO submissions (id, project_id, title, description, submitted_by, submitted_by_name, status, version, created_at, updated_at, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertSubmission.run(
    'sub_1',
    'p1',
    'Milestone 1: Architectural Foundation & Threat Model',
    'Formal architectural blueprint, module responsibility boundaries, and threat model specification.',
    'u1',
    'Alice Watson',
    'SUBMITTED',
    1,
    '2026-08-22T10:00:00.000Z',
    '2026-08-22T14:30:00.000Z',
    '2026-08-22T14:30:00.000Z'
  );

  console.log('Seeded initial submission.');
} catch (e) {
  console.error(e);
}
