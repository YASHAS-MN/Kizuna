import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new DatabaseSync(path.resolve(__dirname, 'data/kizuna.db'));

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED')),
      priority TEXT NOT NULL CHECK(priority IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
      assignee_id TEXT NOT NULL,
      assignee_name TEXT NOT NULL,
      module TEXT NOT NULL,
      created_at TEXT NOT NULL,
      due_date TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);
  console.log('Added tasks table.');

  const insertTask = db.prepare('INSERT OR IGNORE INTO tasks (id, project_id, title, description, status, priority, assignee_id, assignee_name, module, created_at, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertTask.run('t_1', 'p1', 'Authentication & Session Module', 'Implement secure session-based authentication with crypto.scrypt password hashing and HttpOnly cookies.', 'IN_PROGRESS', 'HIGH', 'u1', 'Alice Watson', 'Backend', '2026-08-15T00:00:00.000Z', '2026-08-30');
  insertTask.run('t_2', 'p1', 'Dashboard & Navigation UI', 'Design responsive command center header navbar, workspace quick links, and activity feed widgets.', 'TODO', 'MEDIUM', 'u2', 'Bob Jenkins', 'Frontend', '2026-08-16T00:00:00.000Z', '2026-09-02');
  insertTask.run('t_3', 'p1', 'REST API Integration Testing', 'Write end-to-end integration tests verifying CORS credentials, status codes, and error payloads.', 'REVIEW', 'HIGH', 'u3', 'Charlie Kim', 'Testing', '2026-08-17T00:00:00.000Z', '2026-08-28');
  console.log('Seeded initial tasks.');
} catch (e) {
  console.error(e);
}
