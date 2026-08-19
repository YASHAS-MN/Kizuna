export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  teamId: string;
  createdAt: Date;
}
