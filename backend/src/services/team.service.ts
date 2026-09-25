import { TeamRepository } from '../repositories/team.repository.js';
import { Team, TeamMember } from '../models/team.js';

import { User } from '../models/user.js';

export class TeamService {
  constructor(private teamRepository: TeamRepository) {}

  async getAllTeamsForUser(user: User): Promise<Team[]> {
    return this.teamRepository.findAllForUser(user);
  }

  async getTeamById(id: string): Promise<Team | null> {
    return this.teamRepository.findById(id);
  }

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    return this.teamRepository.findMembersByTeamId(teamId);
  }

  async createTeam(team: Team, members: TeamMember[]): Promise<void> {
    return this.teamRepository.createTeam(team, members);
  }

  async addMember(teamId: string, member: TeamMember): Promise<void> {
    return this.teamRepository.addMember(teamId, member);
  }

  async updateMemberRole(teamId: string, userId: string, role: string): Promise<void> {
    return this.teamRepository.updateMemberRole(teamId, userId, role);
  }

  async removeMember(teamId: string, userId: string): Promise<void> {
    return this.teamRepository.removeMember(teamId, userId);
  }
}
