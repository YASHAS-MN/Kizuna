import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service.js';
import { AuthorizationService } from '../services/authorization.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class ProjectController {
  constructor(
    private projectService: ProjectService,
    private authService: AuthorizationService
  ) {}

  getAllProjects = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      const projects = await this.projectService.getAllProjectsForUser(user);
      res.status(200).json(projects);
    } catch (error) {
      next(error);
    }
  };

  getProjectById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = req.user!;

      if (!(await this.authService.canAccessProject(user, id))) {
        return res.status(403).json({
          status: 'error',
          message: 'Forbidden: You do not have access to this project'
        });
      }

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
