import { Router } from 'express';
import { teamRepository, projectRepository } from '../repositories/index.js';
import { ProjectService } from '../services/project.service.js';
import { ProjectController } from '../controllers/project.controller.js';
import { AuthorizationService } from '../services/authorization.service.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

const projectService = new ProjectService(projectRepository);
const authService = new AuthorizationService(teamRepository, projectRepository);
const projectController = new ProjectController(projectService, authService);

router.get('/projects', requireAuth, projectController.getAllProjects);
router.get('/projects/:id', requireAuth, projectController.getProjectById);

export default router;
