import { Router } from 'express';
import { submissionRepository, teamRepository, projectRepository, activityRepository } from '../repositories/index.js';
import { SubmissionService } from '../services/submission.service.js';
import { SubmissionController } from '../controllers/submission.controller.js';
import { AuthorizationService } from '../services/authorization.service.js';
import { ActivityService } from '../services/activity.service.js';
import { taskRepository } from '../repositories/index.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

const submissionService = new SubmissionService(submissionRepository);
const activityService = new ActivityService(activityRepository);
const authService = new AuthorizationService(
  teamRepository,
  projectRepository,
  taskRepository,
  undefined,
  submissionRepository
);
const submissionController = new SubmissionController(submissionService, authService, activityService);

router.get('/submissions', requireAuth, submissionController.getSubmissionsForProject);
router.get('/submissions/:id', requireAuth, submissionController.getSubmissionById);
router.post('/submissions', requireAuth, submissionController.createSubmission);
router.put('/submissions/:id', requireAuth, submissionController.updateSubmission);
router.post('/submissions/:id/submit', requireAuth, submissionController.submitSubmission);

export default router;
