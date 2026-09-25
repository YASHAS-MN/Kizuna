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

  createProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      const data = req.body;
      
      const cleanName = data.name?.trim();
      const cleanDesc = data.description?.trim();
      
      if (!cleanName || !cleanDesc || !data.teamId) {
        return res.status(400).json({ status: 'error', message: 'Missing required fields' });
      }

      // Check auth: user must be able to modify the team
      if (!(await this.authService.canModifyTeam(user, data.teamId))) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
      }

      const newProject = {
        id: `p_${Date.now()}`,
        name: cleanName,
        description: cleanDesc,
        status: 'PLANNING' as any,
        teamId: data.teamId,
        createdAt: new Date(),
      };

      await this.projectService.createProject(newProject);
      
      const createdProject = await this.projectService.getProjectById(newProject.id);
      res.status(201).json(createdProject);
    } catch (error) {
      next(error);
    }
  };

  updateProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = req.user!;
      const updates = req.body;

      if (!(await this.authService.canModifyProject(user, id))) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
      }

      await this.projectService.updateProject(id, updates);
      
      const updatedProject = await this.projectService.getProjectById(id);
      res.status(200).json(updatedProject);
    } catch (error) {
      next(error);
    }
  };
}
