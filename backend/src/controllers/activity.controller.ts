import { Response, NextFunction } from 'express';
import { ActivityService } from '../services/activity.service.js';
import { AuthorizationService } from '../services/authorization.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { projectRepository } from '../repositories/index.js';
import { ActivityEvent } from '../models/activity.js';

export class ActivityController {
  constructor(
    private activityService: ActivityService,
    private authService: AuthorizationService
  ) {}

  getProjectActivity = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
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

      const events = await this.activityService.getProjectActivity(projectId);
      res.status(200).json(events);
    } catch (error) {
      next(error);
    }
  };

  createActivity = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { projectId } = req.params;
      const user = req.user!;
      const { type, message, taskId, submissionId, metadata, createdAt } = req.body;

      if (!projectId || typeof projectId !== 'string') {
        return res.status(400).json({ status: 'error', message: 'A valid project ID is required.' });
      }

      if (!type || typeof type !== 'string') {
        return res.status(400).json({ status: 'error', message: 'Activity type is required.' });
      }

      if (!message || typeof message !== 'string' || !message.trim()) {
        return res.status(400).json({ status: 'error', message: 'Activity message is required.' });
      }

      const project = await projectRepository.findById(projectId);
      if (!project) {
        return res.status(404).json({ status: 'error', message: 'Project not found' });
      }

      if (!(await this.authService.canAccessProject(user, projectId))) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
      }

      const event: ActivityEvent = {
        id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        projectId,
        actorId: user.id,
        actorName: user.name,
        type: type as any,
        message: message.trim(),
        createdAt: createdAt || new Date().toISOString(),
        taskId: taskId || undefined,
        submissionId: submissionId || undefined,
        metadata: metadata && typeof metadata === 'object' ? metadata : undefined
      };

      const created = await this.activityService.createActivity(event);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  };
}
