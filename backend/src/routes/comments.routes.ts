import { Router } from 'express';
import { commentRepository, teamRepository, projectRepository, taskRepository } from '../repositories/index.js';
import { CommentService } from '../services/comment.service.js';
import { CommentController } from '../controllers/comment.controller.js';
import { AuthorizationService } from '../services/authorization.service.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

const commentService = new CommentService(commentRepository);
const authService = new AuthorizationService(teamRepository, projectRepository, taskRepository, commentRepository);
const commentController = new CommentController(commentService, authService);

router.get('/tasks/:taskId/comments', requireAuth, commentController.getCommentsForTask);
router.post('/tasks/:taskId/comments', requireAuth, commentController.createComment);
router.delete('/comments/:id', requireAuth, commentController.deleteComment);

export default router;
