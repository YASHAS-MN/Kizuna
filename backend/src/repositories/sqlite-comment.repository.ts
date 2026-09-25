import { CommentRepository } from './comment.repository.js';
import { Comment } from '../models/comment.js';
import { db } from '../db/db.js';

export class SQLiteCommentRepository implements CommentRepository {
  async findByTaskId(taskId: string): Promise<Comment[]> {
    const rows = db.prepare('SELECT id, task_id, author_id, author_name, content, created_at FROM comments WHERE task_id = ? ORDER BY created_at ASC').all(taskId) as any[];
    return rows.map(r => this.mapRowToComment(r));
  }

  async findById(id: string): Promise<Comment | null> {
    const row = db.prepare('SELECT id, task_id, author_id, author_name, content, created_at FROM comments WHERE id = ?').get(id) as any;
    if (!row) return null;
    return this.mapRowToComment(row);
  }

  async create(comment: Comment): Promise<Comment> {
    const stmt = db.prepare('INSERT INTO comments (id, task_id, author_id, author_name, content, created_at) VALUES (?, ?, ?, ?, ?, ?)');
    stmt.run(
      comment.id,
      comment.taskId,
      comment.authorId,
      comment.authorName,
      comment.content,
      comment.createdAt
    );
    return comment;
  }

  async delete(id: string): Promise<boolean> {
    const res = db.prepare('DELETE FROM comments WHERE id = ?').run(id);
    return res.changes > 0;
  }

  private mapRowToComment(row: any): Comment {
    return {
      id: row.id,
      taskId: row.task_id,
      authorId: row.author_id,
      authorName: row.author_name,
      content: row.content,
      createdAt: row.created_at
    };
  }
}
