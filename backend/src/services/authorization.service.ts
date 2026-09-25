import { User } from '../models/user.js';
import { TeamRepository } from '../repositories/team.repository.js';
import { ProjectRepository } from '../repositories/project.repository.js';

import { TaskRepository } from '../repositories/task.repository.js';

export class AuthorizationService {
  constructor(
    private teamRepository: TeamRepository,
    private projectRepository: ProjectRepository,
    private taskRepository: TaskRepository
  ) {}

  async canAccessTeam(user: User, teamId: string): Promise<boolean> {
    if (user.role === 'STUDENT') {
      const members = await this.teamRepository.findMembersByTeamId(teamId);
      return members.some(m => m.userId === user.id);
    } else if (user.role === 'MENTOR') {
      const team = await this.teamRepository.findById(teamId);
      return team?.mentorId === user.id;
    }
    return false;
  }

  async canAccessProject(user: User, projectId: string): Promise<boolean> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) return false;
    return this.canAccessTeam(user, project.teamId);
  }

  async canModifyTeam(user: User, teamId: string): Promise<boolean> {
    if (user.role === 'STUDENT') {
      // Students can modify their own team in this domain ruleset (or let's just say access = modify for students for now)
      return this.canAccessTeam(user, teamId);
    }
    return false; // Mentors cannot modify
  }

  async canModifyProject(user: User, projectId: string): Promise<boolean> {
    if (user.role === 'STUDENT') {
      return this.canAccessProject(user, projectId);
    }
    return false; // Mentors cannot modify
  }

  async canAccessTask(user: User, taskId: string): Promise<boolean> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) return false;
    return this.canAccessProject(user, task.projectId);
  }

  async canModifyTask(user: User, taskId: string): Promise<boolean> {
    if (user.role === 'STUDENT') {
      return this.canAccessTask(user, taskId);
    }
    return false; // Mentors cannot modify
  }
}
