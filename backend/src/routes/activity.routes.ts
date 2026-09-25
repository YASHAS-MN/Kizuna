import { Router } from 'express';
import { activityRepository, teamRepository, projectRepository, taskRepository, commentRepository } from '../repositories/index.js';
import { ActivityService } from '../services/activity.service.js';
import { ActivityController } from '../controllers/activity.controller.js';
import { AuthorizationService } from '../services/authorization.service.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

const activityService = new ActivityService(activityRepository);
const authService = new AuthorizationService(teamRepository, projectRepository, taskRepository, commentRepository);
const activityController = new ActivityController(activityService, authService);

router.get('/projects/:projectId/activity', requireAuth, activityController.getProjectActivity);
router.post('/projects/:projectId/activity', requireAuth, activityController.createActivity);

export default router;
