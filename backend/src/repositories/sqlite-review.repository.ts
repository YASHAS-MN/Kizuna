import { ReviewRepository } from './review.repository.js';
import { Review, ReviewStatus } from '../models/review.js';
import { db } from '../db/db.js';

export class SQLiteReviewRepository implements ReviewRepository {
  async findBySubmissionId(submissionId: string): Promise<Review | null> {
    const row = db.prepare(`
      SELECT r.id, r.submission_id, s.project_id, r.reviewer_id, r.reviewer_name, r.feedback, r.status, r.created_at, r.updated_at, r.reviewed_at
      FROM reviews r
      JOIN submissions s ON r.submission_id = s.id
      WHERE r.submission_id = ?
    `).get(submissionId) as any;
    if (!row) return null;
    return this.mapRowToReview(row);
  }

  async findById(id: string): Promise<Review | null> {
    const row = db.prepare(`
      SELECT r.id, r.submission_id, s.project_id, r.reviewer_id, r.reviewer_name, r.feedback, r.status, r.created_at, r.updated_at, r.reviewed_at
      FROM reviews r
      JOIN submissions s ON r.submission_id = s.id
      WHERE r.id = ?
    `).get(id) as any;
    if (!row) return null;
    return this.mapRowToReview(row);
  }

  async create(review: Review): Promise<Review> {
    const stmt = db.prepare(`
      INSERT INTO reviews (id, submission_id, reviewer_id, reviewer_name, feedback, status, created_at, updated_at, reviewed_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      review.id,
      review.submissionId,
      review.reviewerId,
      review.reviewerName,
      review.feedback,
      review.status,
      review.createdAt,
      review.updatedAt,
      review.reviewedAt || null
    );
    return review;
  }

  async update(id: string, updates: Partial<Review>): Promise<Review | null> {
    const setClauses: string[] = [];
    const values: any[] = [];

    if (updates.feedback !== undefined) { setClauses.push('feedback = ?'); values.push(updates.feedback); }
    if (updates.status !== undefined) { setClauses.push('status = ?'); values.push(updates.status); }
    if (updates.updatedAt !== undefined) { setClauses.push('updated_at = ?'); values.push(updates.updatedAt); }
    if (updates.reviewedAt !== undefined) { setClauses.push('reviewed_at = ?'); values.push(updates.reviewedAt); }

    if (setClauses.length === 0) return this.findById(id);

    values.push(id);
    db.prepare(`UPDATE reviews SET ${setClauses.join(', ')} WHERE id = ?`).run(...values);
    return this.findById(id);
  }

  private mapRowToReview(row: any): Review {
    return {
      id: row.id,
      submissionId: row.submission_id,
      projectId: row.project_id, // Joined from submissions table
      reviewerId: row.reviewer_id,
      reviewerName: row.reviewer_name,
      feedback: row.feedback,
      status: row.status as ReviewStatus,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      reviewedAt: row.reviewed_at || undefined
    };
  }
}
