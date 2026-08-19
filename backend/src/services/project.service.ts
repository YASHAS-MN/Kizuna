import { ProjectRepository } from '../repositories/project.repository.js';
import { Project } from '../models/project.js';

export class ProjectService {
  constructor(private projectRepository: ProjectRepository) {}

  async getAllProjects(): Promise<Project[]> {
    return this.projectRepository.findAll();
  }

  async getProjectById(id: string): Promise<Project | null> {
    return this.projectRepository.findById(id);
  }
}
