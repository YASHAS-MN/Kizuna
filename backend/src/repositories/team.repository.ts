import { Team, TeamMember } from '../models/team.js';

export interface TeamRepository {
  findAll(): Promise<Team[]>;
  findById(id: string): Promise<Team | null>;
  findMembersByTeamId(teamId: string): Promise<TeamMember[]>;
}

export class InMemoryTeamRepository implements TeamRepository {
  private teams: Team[] = [
    { id: 't1', name: 'Team Alpha', createdAt: new Date('2026-08-01') },
    { id: 't2', name: 'Team Beta', createdAt: new Date('2026-08-05') }
  ];

  private memberships: TeamMember[] = [
    { teamId: 't1', userId: 'u1', membershipRole: 'Lead Frontend Developer' },
    { teamId: 't1', userId: 'u2', membershipRole: 'UI Designer' },
    { teamId: 't1', userId: 'u3', membershipRole: 'QA Tester' },
    { teamId: 't2', userId: 'u8', membershipRole: 'Machine Learning Lead' },
    { teamId: 't2', userId: 'u9', membershipRole: 'Full Stack Engineer' }
  ];

  async findAll(): Promise<Team[]> {
    return [...this.teams];
  }

  async findById(id: string): Promise<Team | null> {
    const team = this.teams.find(t => t.id === id);
    return team ? { ...team } : null;
  }

  async findMembersByTeamId(teamId: string): Promise<TeamMember[]> {
    return this.memberships.filter(m => m.teamId === teamId).map(m => ({ ...m }));
  }
}
