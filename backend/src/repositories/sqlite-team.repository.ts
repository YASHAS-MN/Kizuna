import { TeamRepository } from './team.repository.js';
import { Team, TeamMember } from '../models/team.js';
import { User } from '../models/user.js';
import { db } from '../db/db.js';

export class SQLiteTeamRepository implements TeamRepository {
  async findAll(): Promise<Team[]> {
    const rows = db.prepare('SELECT id, name, created_at, mentor_id FROM teams').all() as any[];
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      createdAt: new Date(r.created_at),
      mentorId: r.mentor_id
    }));
  }

  async findAllForUser(user: User): Promise<Team[]> {
    let query = '';
    let params: any[] = [];

    if (user.role === 'STUDENT') {
      query = `
        SELECT t.id, t.name, t.created_at, t.mentor_id 
        FROM teams t
        JOIN team_members tm ON t.id = tm.team_id
        WHERE tm.user_id = ?
      `;
      params = [user.id];
    } else if (user.role === 'MENTOR') {
      query = `
        SELECT id, name, created_at, mentor_id 
        FROM teams 
        WHERE mentor_id = ?
      `;
      params = [user.id];
    } else {
      return []; // Staff/Admin not handled in this slice
    }

    const rows = db.prepare(query).all(...params) as any[];
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      createdAt: new Date(r.created_at),
      mentorId: r.mentor_id
    }));
  }

  async findById(id: string): Promise<Team | null> {
    const row = db.prepare('SELECT id, name, created_at, mentor_id FROM teams WHERE id = ?').get(id) as any;
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      createdAt: new Date(row.created_at),
      mentorId: row.mentor_id
    };
  }

  async findMembersByTeamId(teamId: string): Promise<TeamMember[]> {
    const rows = db.prepare('SELECT team_id, user_id, membership_role FROM team_members WHERE team_id = ?').all(teamId) as any[];
    return rows.map(r => ({
      teamId: r.team_id,
      userId: r.user_id,
      membershipRole: r.membership_role
    }));
  }
}
