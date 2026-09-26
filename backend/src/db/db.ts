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
      created_at TEXT NOT NULL,
      mentor_id TEXT REFERENCES users(id) ON DELETE SET NULL
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
    
    // Test helper account: hi / 123
    const hiPasswordHash = '1de56606996311534225d532540b30e9:ffc5bfc0ae4e34bab8f265061e6a92238cfaa1fd3f4968d7059461e4ef301d280951c958ab7e0eedae19f70e0b7093998b9539f1599bef1b518b59cf61b9b90c';
    insertUser.run('u10', 'hi', 'hi@kizuna.edu', 'STUDENT', hiPasswordHash);

    // Seed Teams
    const insertTeam = db.prepare('INSERT INTO teams (id, name, created_at, mentor_id) VALUES (?, ?, ?, ?)');
    insertTeam.run('t1', 'Team Alpha', '2026-08-01T00:00:00.000Z', 'u4'); // Sarah
    insertTeam.run('t2', 'Team Beta', '2026-08-05T00:00:00.000Z', 'u5'); // Alan

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

    // Seed Tasks
    const insertTask = db.prepare('INSERT INTO tasks (id, project_id, title, description, status, priority, assignee_id, assignee_name, module, created_at, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    insertTask.run('t_1', 'p1', 'Authentication & Session Module', 'Implement secure session-based authentication with crypto.scrypt password hashing and HttpOnly cookies.', 'IN_PROGRESS', 'HIGH', 'u1', 'Alice Watson', 'Backend', '2026-08-15T00:00:00.000Z', '2026-08-30');
    insertTask.run('t_2', 'p1', 'Dashboard & Navigation UI', 'Design responsive command center header navbar, workspace quick links, and activity feed widgets.', 'TODO', 'MEDIUM', 'u2', 'Bob Jenkins', 'Frontend', '2026-08-16T00:00:00.000Z', '2026-09-02');
    insertTask.run('t_3', 'p1', 'REST API Integration Testing', 'Write end-to-end integration tests verifying CORS credentials, status codes, and error payloads.', 'REVIEW', 'HIGH', 'u3', 'Charlie Kim', 'Testing', '2026-08-17T00:00:00.000Z', '2026-08-28');
    
    // Seed Comments
    const insertComment = db.prepare('INSERT INTO comments (id, task_id, author_id, author_name, content, created_at) VALUES (?, ?, ?, ?, ?, ?)');
    insertComment.run('c_1', 't_1', 'u1', 'Alice Watson', 'Can you verify the API response format?', '2026-08-20T10:12:00.000Z');
    insertComment.run('c_2', 't_1', 'u2', 'Bob Jenkins', "Yes, I'll check it today.", '2026-08-20T10:35:00.000Z');

    // Seed Activity Events
    const insertActivity = db.prepare('INSERT INTO activity_events (id, project_id, actor_id, actor_name, type, message, created_at, task_id, submission_id, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
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

    // Seed Submissions
    const insertSubmission = db.prepare('INSERT INTO submissions (id, project_id, title, description, submitted_by, submitted_by_name, status, version, created_at, updated_at, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
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

    console.log('SQLite database seeded successfully.');
  } else {
    console.log('SQLite database already populated. Seeding skipped.');
  }
}
