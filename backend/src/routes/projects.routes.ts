import { Router } from 'express';
import { projectRepository } from '../repositories/index.js';
import { ProjectService } from '../services/project.service.js';
import { ProjectController } from '../controllers/project.controller.js';

const router = Router();

const projectService = new ProjectService(projectRepository);
const projectController = new ProjectController(projectService);

router.get('/projects', projectController.getAllProjects);
router.get('/projects/:id', projectController.getProjectById);

export default router;
