import { ProjectRepository } from './project.repository.js';
import { Project } from '../models/project.js';
import { db } from '../db/db.js';

export class SQLiteProjectRepository implements ProjectRepository {
  async findAll(): Promise<Project[]> {
    const rows = db.prepare('SELECT id, name, description, status, team_id, created_at FROM projects').all() as any[];
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      status: r.status,
      teamId: r.team_id,
      createdAt: new Date(r.created_at)
    }));
  }

  async findById(id: string): Promise<Project | null> {
    const row = db.prepare('SELECT id, name, description, status, team_id, created_at FROM projects WHERE id = ?').get(id) as any;
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      status: row.status,
      teamId: row.team_id,
      createdAt: new Date(row.created_at)
    };
  }
}
