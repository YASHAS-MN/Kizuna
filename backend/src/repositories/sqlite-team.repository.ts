import { TeamRepository } from './team.repository.js';
import { Team, TeamMember } from '../models/team.js';
import { db } from '../db/db.js';

export class SQLiteTeamRepository implements TeamRepository {
  async findAll(): Promise<Team[]> {
    const rows = db.prepare('SELECT id, name, created_at FROM teams').all() as any[];
    return rows.map(r => ({
      id: r.id,
      name: r.name,
      createdAt: new Date(r.created_at)
    }));
  }

  async findById(id: string): Promise<Team | null> {
    const row = db.prepare('SELECT id, name, created_at FROM teams WHERE id = ?').get(id) as any;
    if (!row) return null;
    return {
      id: row.id,
      name: row.name,
      createdAt: new Date(row.created_at)
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
