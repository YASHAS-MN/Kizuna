import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new DatabaseSync(path.resolve(__dirname, 'data/kizuna.db'));

try {
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity_events (
      id TEXT PRIMARY KEY,
      project_id TEXT NOT NULL,
      actor_id TEXT NOT NULL,
      actor_name TEXT NOT NULL,
      type TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL,
      task_id TEXT,
      submission_id TEXT,
      metadata TEXT,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );
  `);
  console.log('Added activity_events table.');

  const insertActivity = db.prepare('INSERT OR IGNORE INTO activity_events (id, project_id, actor_id, actor_name, type, message, created_at, task_id, submission_id, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
  insertActivity.run('act_1', 'p1', 'u1', 'Alice Watson', 'PROJECT_CREATED', 'created project "Kizuna Platform Foundation"', '2026-08-10T09:00:00.000Z', null, null, null);
  insertActivity.run('act_2', 'p1', 'u1', 'Alice Watson', 'TEAM_MEMBER_ADDED', 'added Bob Jenkins to the project team', '2026-08-10T09:15:00.000Z', null, null, null);
  insertActivity.run('act_3', 'p1', 'u1', 'Alice Watson', 'TEAM_MEMBER_ADDED', 'added Charlie Kim to the project team', '2026-08-10T09:16:00.000Z', null, null, null);
  insertActivity.run('act_4', 'p1', 'u1', 'Alice Watson', 'TASK_CREATED', 'created task "Authentication & Session Module"', '2026-08-15T10:32:00.000Z', 't_1', null, null);
  insertActivity.run('act_5', 'p1', 'u1', 'Alice Watson', 'TASK_STATUS_CHANGED', 'moved "Authentication & Session Module" from TODO → IN_PROGRESS', '2026-08-15T14:20:00.000Z', 't_1', null, JSON.stringify({ from: 'TODO', to: 'IN_PROGRESS' }));
  insertActivity.run('act_6', 'p1', 'u1', 'Alice Watson', 'TASK_CREATED', 'created task "Dashboard & Navigation UI"', '2026-08-16T11:15:00.000Z', 't_2', null, null);
  insertActivity.run('act_7', 'p1', 'u1', 'Alice Watson', 'TASK_ASSIGNED', 'assigned "Dashboard & Navigation UI" to Bob Jenkins', '2026-08-16T11:16:00.000Z', 't_2', null, null);
  insertActivity.run('act_8', 'p1', 'u1', 'Alice Watson', 'TASK_CREATED', 'created task "REST API Integration Testing"', '2026-08-17T12:04:00.000Z', 't_3', null, null);
  insertActivity.run('act_9', 'p1', 'u1', 'Alice Watson', 'TASK_ASSIGNED', 'assigned "REST API Integration Testing" to Charlie Kim', '2026-08-17T12:05:00.000Z', 't_3', null, null);
  insertActivity.run('act_10', 'p1', 'u3', 'Charlie Kim', 'TASK_STATUS_CHANGED', 'moved "REST API Integration Testing" from TODO → REVIEW', '2026-08-18T16:40:00.000Z', 't_3', null, JSON.stringify({ from: 'TODO', to: 'REVIEW' }));
  insertActivity.run('act_11', 'p1', 'u1', 'Alice Watson', 'COMMENT_ADDED', 'commented on "Authentication & Session Module"', '2026-08-20T10:12:00.000Z', 't_1', null, null);
  insertActivity.run('act_12', 'p1', 'u2', 'Bob Jenkins', 'COMMENT_ADDED', 'commented on "Authentication & Session Module"', '2026-08-20T10:35:00.000Z', 't_1', null, null);
  insertActivity.run('act_13', 'p2', 'u8', 'David Smith', 'PROJECT_CREATED', 'created project "AI-Powered Resume Analyzer"', '2026-08-12T08:00:00.000Z', null, null, null);

  console.log('Seeded initial activity events.');
} catch (e) {
  console.error(e);
}
