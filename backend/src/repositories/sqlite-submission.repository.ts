import { SubmissionRepository } from './submission.repository.js';
import { Submission, SubmissionStatus } from '../models/submission.js';
import { db } from '../db/db.js';

export class SQLiteSubmissionRepository implements SubmissionRepository {
  async findByProjectId(projectId: string): Promise<Submission[]> {
    const rows = db.prepare(
      'SELECT id, project_id, title, description, submitted_by, submitted_by_name, status, version, created_at, updated_at, submitted_at FROM submissions WHERE project_id = ? ORDER BY updated_at DESC'
    ).all(projectId) as any[];
    return rows.map(r => this.mapRowToSubmission(r));
  }

  async findById(id: string): Promise<Submission | null> {
    const row = db.prepare(
      'SELECT id, project_id, title, description, submitted_by, submitted_by_name, status, version, created_at, updated_at, submitted_at FROM submissions WHERE id = ?'
    ).get(id) as any;
    if (!row) return null;
    return this.mapRowToSubmission(row);
  }

  async create(submission: Submission): Promise<Submission> {
    const stmt = db.prepare(
      'INSERT INTO submissions (id, project_id, title, description, submitted_by, submitted_by_name, status, version, created_at, updated_at, submitted_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    stmt.run(
      submission.id,
      submission.projectId,
      submission.title,
      submission.description,
      submission.submittedBy,
      submission.submittedByName,
      submission.status,
      submission.version,
      submission.createdAt,
      submission.updatedAt,
      submission.submittedAt || null
    );
    return submission;
  }

  async update(id: string, updates: Partial<Submission>): Promise<Submission | null> {
    const setClauses: string[] = [];
    const values: any[] = [];

    if (updates.title !== undefined) { setClauses.push('title = ?'); values.push(updates.title); }
    if (updates.description !== undefined) { setClauses.push('description = ?'); values.push(updates.description); }
    if (updates.updatedAt !== undefined) { setClauses.push('updated_at = ?'); values.push(updates.updatedAt); }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);
    db.prepare(`UPDATE submissions SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  }

  async updateStatus(id: string, status: SubmissionStatus, extra?: { submittedAt?: string; updatedAt?: string }): Promise<Submission | null> {
    const now = extra?.updatedAt || new Date().toISOString();
    const setClauses = ['status = ?', 'updated_at = ?'];
    const values: any[] = [status, now];

    if (extra?.submittedAt) {
      setClauses.push('submitted_at = ?');
      values.push(extra.submittedAt);
    }

    values.push(id);
    db.prepare(`UPDATE submissions SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  }

  private mapRowToSubmission(row: any): Submission {
    return {
      id: row.id,
      projectId: row.project_id,
      title: row.title,
      description: row.description,
      submittedBy: row.submitted_by,
      submittedByName: row.submitted_by_name,
      status: row.status as SubmissionStatus,
      version: row.version,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      submittedAt: row.submitted_at || undefined
    };
  }
}
