import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.resolve(__dirname, './data/kizuna.db');

const db = new DatabaseSync(DB_PATH);

try {
  // Check if mentor_id already exists
  const cols = db.prepare('PRAGMA table_info(teams)').all();
  const hasMentorId = cols.some(c => c.name === 'mentor_id');
  if (!hasMentorId) {
    db.exec('ALTER TABLE teams ADD COLUMN mentor_id TEXT REFERENCES users(id)');
    // Set mentors for t1 and t2 based on frontend seeds
    const updateTeam = db.prepare('UPDATE teams SET mentor_id = ? WHERE id = ?');
    updateTeam.run('u4', 't1'); // Sarah Jenkins
    updateTeam.run('u5', 't2'); // Alan Vance
    console.log('Added mentor_id column and seeded mentors.');
  } else {
    console.log('mentor_id column already exists.');
  }
} catch (err) {
  console.error('Migration failed:', err);
}
