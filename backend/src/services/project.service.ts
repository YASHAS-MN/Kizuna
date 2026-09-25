import { ProjectRepository } from '../repositories/project.repository.js';
import { Project } from '../models/project.js';

import { User } from '../models/user.js';

export class ProjectService {
  constructor(private projectRepository: ProjectRepository) {}

  async getAllProjectsForUser(user: User): Promise<Project[]> {
    return this.projectRepository.findAllForUser(user);
  }

  async getProjectById(id: string): Promise<Project | null> {
    return this.projectRepository.findById(id);
  }

  async createProject(project: Project): Promise<void> {
    return this.projectRepository.createProject(project);
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<void> {
    return this.projectRepository.updateProject(id, updates);
  }
}
