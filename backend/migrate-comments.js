import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new DatabaseSync(path.resolve(__dirname, 'data/kizuna.db'));

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS comments (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      author_id TEXT NOT NULL,
      author_name TEXT NOT NULL,
      content TEXT NOT NULL,
      created_at TEXT NOT NULL,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  console.log('Added comments table.');

  const insertComment = db.prepare('INSERT OR IGNORE INTO comments (id, task_id, author_id, author_name, content, created_at) VALUES (?, ?, ?, ?, ?, ?)');
  insertComment.run('c_1', 't_1', 'u1', 'Alice Watson', 'Can you verify the API response format?', '2026-08-20T10:12:00.000Z');
  insertComment.run('c_2', 't_1', 'u2', 'Bob Jenkins', "Yes, I'll check it today.", '2026-08-20T10:35:00.000Z');
  console.log('Seeded initial comments.');
} catch (e) {
  console.error(e);
}
