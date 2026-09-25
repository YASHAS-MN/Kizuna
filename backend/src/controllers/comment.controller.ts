import { Response, NextFunction } from 'express';
import { CommentService } from '../services/comment.service.js';
import { AuthorizationService } from '../services/authorization.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { taskRepository } from '../repositories/index.js';

export class CommentController {
  constructor(
    private commentService: CommentService,
    private authService: AuthorizationService
  ) {}

  getCommentsForTask = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { taskId } = req.params;
      const user = req.user!;

      if (!taskId || typeof taskId !== 'string') {
        return res.status(400).json({ status: 'error', message: 'A valid task ID is required.' });
      }

      const task = await taskRepository.findById(taskId);
      if (!task) {
        return res.status(404).json({ status: 'error', message: 'Task not found' });
      }

      if (!(await this.authService.canAccessTask(user, taskId))) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
      }

      const comments = await this.commentService.getCommentsForTask(taskId);
      res.status(200).json(comments);
    } catch (error) {
      next(error);
    }
  };

  createComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { taskId } = req.params;
      const user = req.user!;
      const { content } = req.body;

      if (!taskId || typeof taskId !== 'string') {
        return res.status(400).json({ status: 'error', message: 'A valid task ID is required.' });
      }

      if (!content || typeof content !== 'string' || !content.trim()) {
        return res.status(400).json({ status: 'error', message: 'Comment cannot be empty.' });
      }

      const task = await taskRepository.findById(taskId);
      if (!task) {
        return res.status(404).json({ status: 'error', message: 'Task not found' });
      }

      if (!(await this.authService.canModifyTask(user, taskId))) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
      }

      const newComment = {
        id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        taskId,
        authorId: user.id,
        authorName: user.name,
        content: content.trim(),
        createdAt: new Date().toISOString()
      };

      const created = await this.commentService.createComment(newComment);
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  };

  deleteComment = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = req.user!;

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ status: 'error', message: 'Comment ID is required' });
      }

      const existing = await this.commentService.getCommentById(id);
      if (!existing) {
        return res.status(404).json({ status: 'error', message: 'Comment not found' });
      }

      if (!(await this.authService.canModifyComment(user, id))) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
      }

      await this.commentService.deleteComment(id);
      res.status(200).json({ status: 'success' });
    } catch (error) {
      next(error);
    }
  };
}
