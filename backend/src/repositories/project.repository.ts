import { Project } from '../models/project.js';

export interface ProjectRepository {
  findAll(): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
}

export class InMemoryProjectRepository implements ProjectRepository {
  private projects: Project[] = [
    {
      id: 'p1',
      name: 'Kizuna Platform Foundation',
      description: 'Initial scaffolding and structural styling for the student collaborative ecosystem.',
      status: 'ACTIVE',
      teamId: 't1',
      createdAt: new Date('2026-08-10')
    },
    {
      id: 'p2',
      name: 'AI-Powered Resume Analyzer',
      description: 'An AI-driven parsing assistant that checks resume alignment with tech job descriptions.',
      status: 'PLANNING',
      teamId: 't2',
      createdAt: new Date('2026-08-12')
    }
  ];

  async findAll(): Promise<Project[]> {
    return [...this.projects];
  }

  async findById(id: string): Promise<Project | null> {
    const project = this.projects.find(p => p.id === id);
    return project ? { ...project } : null;
  }
}
