import { Router } from 'express';
import { taskRepository, teamRepository, projectRepository } from '../repositories/index.js';
import { TaskService } from '../services/task.service.js';
import { TaskController } from '../controllers/task.controller.js';
import { AuthorizationService } from '../services/authorization.service.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

const taskService = new TaskService(taskRepository);
const authService = new AuthorizationService(teamRepository, projectRepository, taskRepository);
const taskController = new TaskController(taskService, authService);

router.get('/tasks', requireAuth, taskController.getTasksForProject);
router.get('/tasks/:id', requireAuth, taskController.getTaskById);
router.post('/tasks', requireAuth, taskController.createTask);
router.put('/tasks/:id', requireAuth, taskController.updateTask);
router.delete('/tasks/:id', requireAuth, taskController.deleteTask);

export default router;
