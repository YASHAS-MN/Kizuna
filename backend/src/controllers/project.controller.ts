import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service.js';

export class ProjectController {
  constructor(private projectService: ProjectService) {}

  getAllProjects = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const projects = await this.projectService.getAllProjects();
      res.status(200).json(projects);
    } catch (error) {
      next(error);
    }
  };

  getProjectById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const project = await this.projectService.getProjectById(id);

      if (!project) {
        return res.status(404).json({
          status: 'error',
          message: `Project with ID '${id}' not found`
        });
      }

      res.status(200).json(project);
    } catch (error) {
      next(error);
    }
  };
}
