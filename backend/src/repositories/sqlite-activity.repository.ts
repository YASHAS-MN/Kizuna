import { ActivityRepository } from './activity.repository.js';
import { ActivityEvent, ActivityEventType } from '../models/activity.js';
import { db } from '../db/db.js';

export class SQLiteActivityRepository implements ActivityRepository {
  async findByProjectId(projectId: string): Promise<ActivityEvent[]> {
    const rows = db.prepare('SELECT id, project_id, actor_id, actor_name, type, message, created_at, task_id, submission_id, metadata FROM activity_events WHERE project_id = ? ORDER BY created_at DESC').all(projectId) as any[];
    return rows.map(r => this.mapRowToActivity(r));
  }

  async create(event: ActivityEvent): Promise<ActivityEvent> {
    const stmt = db.prepare('INSERT INTO activity_events (id, project_id, actor_id, actor_name, type, message, created_at, task_id, submission_id, metadata) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(
      event.id,
      event.projectId,
      event.actorId,
      event.actorName,
      event.type,
      event.message,
      event.createdAt,
      event.taskId || null,
      event.submissionId || null,
      event.metadata ? JSON.stringify(event.metadata) : null
    );
    return event;
  }

  private mapRowToActivity(row: any): ActivityEvent {
    let parsedMetadata: Record<string, string> | undefined = undefined;
    if (row.metadata) {
      try {
        parsedMetadata = JSON.parse(row.metadata);
      } catch (e) {
        parsedMetadata = undefined;
      }
    }

    return {
      id: row.id,
      projectId: row.project_id,
      actorId: row.actor_id,
      actorName: row.actor_name,
      type: row.type as ActivityEventType,
      message: row.message,
      createdAt: row.created_at,
      taskId: row.task_id || undefined,
      submissionId: row.submission_id || undefined,
      metadata: parsedMetadata
    };
  }
}
