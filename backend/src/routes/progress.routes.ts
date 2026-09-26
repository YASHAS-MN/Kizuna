import { Router } from 'express';
import { taskRepository, teamRepository, projectRepository, commentRepository } from '../repositories/index.js';
import { ProgressService } from '../services/progress.service.js';
import { ProgressController } from '../controllers/progress.controller.js';
import { AuthorizationService } from '../services/authorization.service.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

const progressService = new ProgressService(taskRepository);
const authService = new AuthorizationService(teamRepository, projectRepository, taskRepository, commentRepository);
const progressController = new ProgressController(progressService, authService);

router.get('/projects/:projectId/progress', requireAuth, progressController.getProjectProgress);

export default router;
