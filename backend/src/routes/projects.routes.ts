import { Router } from 'express';
import { InMemoryProjectRepository } from '../repositories/project.repository.js';
import { ProjectService } from '../services/project.service.js';
import { ProjectController } from '../controllers/project.controller.js';

const router = Router();

const projectRepository = new InMemoryProjectRepository();
const projectService = new ProjectService(projectRepository);
const projectController = new ProjectController(projectService);

router.get('/projects', projectController.getAllProjects);
router.get('/projects/:id', projectController.getProjectById);

export default router;
