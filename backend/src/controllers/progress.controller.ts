import { Response, NextFunction } from 'express';
import { ProgressService } from '../services/progress.service.js';
import { AuthorizationService } from '../services/authorization.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { projectRepository } from '../repositories/index.js';

export class ProgressController {
  constructor(
    private progressService: ProgressService,
    private authService: AuthorizationService
  ) {}

  getProjectProgress = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { projectId } = req.params;
      const user = req.user!;

      if (!projectId || typeof projectId !== 'string') {
        return res.status(400).json({ status: 'error', message: 'A valid project ID is required.' });
      }

      const project = await projectRepository.findById(projectId);
      if (!project) {
        return res.status(404).json({ status: 'error', message: 'Project not found' });
      }

      if (!(await this.authService.canAccessProject(user, projectId))) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
      }

      const snapshot = await this.progressService.getProjectProgress(projectId);
      res.status(200).json(snapshot);
    } catch (error) {
      next(error);
    }
  };
}
