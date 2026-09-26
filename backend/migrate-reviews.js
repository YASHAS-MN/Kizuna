import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, 'data/kizuna.db');

console.log(`Connecting to database at ${dbPath}`);
const db = new DatabaseSync(dbPath);

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS reviews (
      id TEXT PRIMARY KEY,
      submission_id TEXT NOT NULL UNIQUE,
      reviewer_id TEXT NOT NULL,
      reviewer_name TEXT NOT NULL,
      feedback TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('IN_REVIEW', 'REVIEWED')),
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      reviewed_at TEXT,
      FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
      FOREIGN KEY (reviewer_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  console.log('Added reviews table.');
} catch (err) {
  console.error('Error running migration:', err);
  process.exit(1);
}
