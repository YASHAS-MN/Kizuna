import { Request, Response, NextFunction } from 'express';
import { TaskService } from '../services/task.service.js';
import { AuthorizationService } from '../services/authorization.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { teamRepository, projectRepository } from '../repositories/index.js';

export class TaskController {
  constructor(
    private taskService: TaskService,
    private authService: AuthorizationService
  ) {}

  getTasksForProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { projectId } = req.query;
      if (!projectId || typeof projectId !== 'string') {
        return res.status(400).json({ status: 'error', message: 'projectId query parameter is required' });
      }

      const user = req.user!;
      if (!(await this.authService.canAccessProject(user, projectId))) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
      }

      const tasks = await this.taskService.getTasksForProject(projectId);
      res.status(200).json(tasks);
    } catch (error) {
      next(error);
    }
  };

  getTaskById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = req.user!;

      if (!(await this.authService.canAccessTask(user, id))) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
      }

      const task = await this.taskService.getTaskById(id);
      if (!task) {
        return res.status(404).json({ status: 'error', message: 'Task not found' });
      }

      res.status(200).json(task);
    } catch (error) {
      next(error);
    }
  };

  createTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      const data = req.body;

      if (!data.projectId || !data.title || !data.description || !data.module || !data.assigneeId || !data.priority) {
        return res.status(400).json({ status: 'error', message: 'Missing required fields' });
      }

      if (!(await this.authService.canModifyProject(user, data.projectId))) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
      }

      // Enforce that assignee is a member of the project's team
      const project = await projectRepository.findById(data.projectId);
      if (!project) {
        return res.status(404).json({ status: 'error', message: 'Project not found' });
      }
      
      const teamMembers = await teamRepository.findMembersByTeamId(project.teamId);
      if (!teamMembers.some(m => m.userId === data.assigneeId)) {
        return res.status(400).json({ status: 'error', message: 'Assignee is not a member of the project team' });
      }

      const newTask = {
        id: `t_${Date.now()}`,
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        status: data.status || 'TODO',
        priority: data.priority,
        assigneeId: data.assigneeId,
        assigneeName: data.assigneeName,
        module: data.module,
        createdAt: new Date(),
        dueDate: data.dueDate
      };

      await this.taskService.createTask(newTask);
      
      const createdTask = await this.taskService.getTaskById(newTask.id);
      res.status(201).json(createdTask);
    } catch (error) {
      next(error);
    }
  };

  updateTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = req.user!;
      const updates = req.body;

      if (!(await this.authService.canModifyTask(user, id))) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
      }

      if (updates.assigneeId) {
        const task = await this.taskService.getTaskById(id);
        if (task) {
          const project = await projectRepository.findById(task.projectId);
          if (project) {
            const teamMembers = await teamRepository.findMembersByTeamId(project.teamId);
            if (!teamMembers.some(m => m.userId === updates.assigneeId)) {
              return res.status(400).json({ status: 'error', message: 'Assignee is not a member of the project team' });
            }
          }
        }
      }

      await this.taskService.updateTask(id, updates);
      
      const updatedTask = await this.taskService.getTaskById(id);
      res.status(200).json(updatedTask);
    } catch (error) {
      next(error);
    }
  };

  deleteTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = req.user!;

      if (!(await this.authService.canModifyTask(user, id))) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
      }

      await this.taskService.deleteTask(id);
      res.status(200).json({ status: 'success' });
    } catch (error) {
      next(error);
    }
  };
}
