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

  async createTeam(team: Team, members: TeamMember[]): Promise<void> {
    const insertTeam = db.prepare('INSERT INTO teams (id, name, created_at, mentor_id) VALUES (?, ?, ?, ?)');
    const insertMember = db.prepare('INSERT INTO team_members (team_id, user_id, membership_role) VALUES (?, ?, ?)');
    
    // SQLite doesn't have a simple async transaction API in node:sqlite natively without executing BEGIN/COMMIT manually
    // For this prototype, we execute sequentially
    db.exec('BEGIN TRANSACTION');
    try {
      insertTeam.run(team.id, team.name, team.createdAt.toISOString(), team.mentorId || null);
      for (const m of members) {
        insertMember.run(m.teamId, m.userId, m.membershipRole);
      }
      db.exec('COMMIT');
    } catch (err) {
      db.exec('ROLLBACK');
      throw err;
    }
  }

  async addMember(teamId: string, member: TeamMember): Promise<void> {
    const insertMember = db.prepare('INSERT INTO team_members (team_id, user_id, membership_role) VALUES (?, ?, ?)');
    insertMember.run(member.teamId, member.userId, member.membershipRole);
  }

  async updateMemberRole(teamId: string, userId: string, role: string): Promise<void> {
    const updateMember = db.prepare('UPDATE team_members SET membership_role = ? WHERE team_id = ? AND user_id = ?');
    updateMember.run(role, teamId, userId);
  }

  async removeMember(teamId: string, userId: string): Promise<void> {
    const deleteMember = db.prepare('DELETE FROM team_members WHERE team_id = ? AND user_id = ?');
    deleteMember.run(teamId, userId);
  }
}
