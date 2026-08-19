import { TeamRepository } from '../repositories/team.repository.js';
import { Team, TeamMember } from '../models/team.js';

export class TeamService {
  constructor(private teamRepository: TeamRepository) {}

  async getAllTeams(): Promise<Team[]> {
    return this.teamRepository.findAll();
  }

  async getTeamById(id: string): Promise<Team | null> {
    return this.teamRepository.findById(id);
  }

  async getTeamMembers(teamId: string): Promise<TeamMember[]> {
    return this.teamRepository.findMembersByTeamId(teamId);
  }
}
