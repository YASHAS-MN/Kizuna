import { ProjectRepository } from './project.repository.js';
import { Project } from '../models/project.js';
import { User } from '../models/user.js';
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

  async findAllForUser(user: User): Promise<Project[]> {
    let query = '';
    let params: any[] = [];

    if (user.role === 'STUDENT') {
      query = `
        SELECT p.id, p.name, p.description, p.status, p.team_id, p.created_at
        FROM projects p
        JOIN team_members tm ON p.team_id = tm.team_id
        WHERE tm.user_id = ?
      `;
      params = [user.id];
    } else if (user.role === 'MENTOR') {
      query = `
        SELECT p.id, p.name, p.description, p.status, p.team_id, p.created_at
        FROM projects p
        JOIN teams t ON p.team_id = t.id
        WHERE t.mentor_id = ?
      `;
      params = [user.id];
    } else {
      return [];
    }

    const rows = db.prepare(query).all(...params) as any[];
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

  async createProject(project: Project): Promise<void> {
    const insertProject = db.prepare('INSERT INTO projects (id, name, description, status, team_id, created_at) VALUES (?, ?, ?, ?, ?, ?)');
    insertProject.run(
      project.id,
      project.name,
      project.description,
      project.status,
      project.teamId,
      project.createdAt.toISOString()
    );
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<void> {
    // Dynamic update query
    const setClause: string[] = [];
    const values: any[] = [];
    
    if (updates.name !== undefined) {
      setClause.push('name = ?');
      values.push(updates.name);
    }
    if (updates.description !== undefined) {
      setClause.push('description = ?');
      values.push(updates.description);
    }
    if (updates.status !== undefined) {
      setClause.push('status = ?');
      values.push(updates.status);
    }
    
    if (setClause.length === 0) return;
    
    values.push(id);
    const query = `UPDATE projects SET ${setClause.join(', ')} WHERE id = ?`;
    const updateProjectStmt = db.prepare(query);
    updateProjectStmt.run(...values);
  }
}
