import { TaskRepository } from './task.repository.js';
import { Task, TaskStatus, TaskPriority } from '../models/task.js';
import { db } from '../db/db.js';

export class SQLiteTaskRepository implements TaskRepository {
  async findById(id: string): Promise<Task | null> {
    const row = db.prepare('SELECT id, project_id, title, description, status, priority, assignee_id, assignee_name, module, created_at, due_date FROM tasks WHERE id = ?').get(id) as any;
    if (!row) return null;
    return this.mapRowToTask(row);
  }

  async findByProjectId(projectId: string): Promise<Task[]> {
    const rows = db.prepare('SELECT id, project_id, title, description, status, priority, assignee_id, assignee_name, module, created_at, due_date FROM tasks WHERE project_id = ?').all(projectId) as any[];
    return rows.map(r => this.mapRowToTask(r));
  }

  async createTask(task: Task): Promise<void> {
    const stmt = db.prepare('INSERT INTO tasks (id, project_id, title, description, status, priority, assignee_id, assignee_name, module, created_at, due_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)');
    stmt.run(
      task.id,
      task.projectId,
      task.title,
      task.description,
      task.status,
      task.priority,
      task.assigneeId,
      task.assigneeName,
      task.module,
      task.createdAt.toISOString(),
      task.dueDate || null
    );
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    const setClause: string[] = [];
    const values: any[] = [];
    
    if (updates.title !== undefined) { setClause.push('title = ?'); values.push(updates.title); }
    if (updates.description !== undefined) { setClause.push('description = ?'); values.push(updates.description); }
    if (updates.status !== undefined) { setClause.push('status = ?'); values.push(updates.status); }
    if (updates.priority !== undefined) { setClause.push('priority = ?'); values.push(updates.priority); }
    if (updates.assigneeId !== undefined) { setClause.push('assignee_id = ?'); values.push(updates.assigneeId); }
    if (updates.assigneeName !== undefined) { setClause.push('assignee_name = ?'); values.push(updates.assigneeName); }
    if (updates.module !== undefined) { setClause.push('module = ?'); values.push(updates.module); }
    if (updates.dueDate !== undefined) { setClause.push('due_date = ?'); values.push(updates.dueDate); }
    
    if (setClause.length === 0) return;
    
    values.push(id);
    const query = `UPDATE tasks SET ${setClause.join(', ')} WHERE id = ?`;
    db.prepare(query).run(...values);
  }

  async deleteTask(id: string): Promise<boolean> {
    const res = db.prepare('DELETE FROM tasks WHERE id = ?').run(id);
    return res.changes > 0;
  }

  private mapRowToTask(row: any): Task {
    return {
      id: row.id,
      projectId: row.project_id,
      title: row.title,
      description: row.description,
      status: row.status as TaskStatus,
      priority: row.priority as TaskPriority,
      assigneeId: row.assignee_id,
      assigneeName: row.assignee_name,
      module: row.module,
      createdAt: new Date(row.created_at),
      dueDate: row.due_date || undefined
    };
  }
}
