import { Router } from 'express';
import { reviewRepository, submissionRepository, teamRepository, projectRepository, activityRepository, taskRepository } from '../repositories/index.js';
import { ReviewService } from '../services/review.service.js';
import { SubmissionService } from '../services/submission.service.js';
import { ReviewController } from '../controllers/review.controller.js';
import { AuthorizationService } from '../services/authorization.service.js';
import { ActivityService } from '../services/activity.service.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

const submissionService = new SubmissionService(submissionRepository);
const reviewService = new ReviewService(reviewRepository, submissionService);
const activityService = new ActivityService(activityRepository);
const authService = new AuthorizationService(
  teamRepository,
  projectRepository,
  taskRepository,
  undefined,
  submissionRepository,
  reviewRepository
);
const reviewController = new ReviewController(reviewService, submissionService, authService, activityService);

router.get('/submissions/:submissionId/review', requireAuth, reviewController.getReviewForSubmission);
router.post('/submissions/:submissionId/review', requireAuth, reviewController.startReview);
router.put('/reviews/:id', requireAuth, reviewController.updateFeedback);
router.post('/reviews/:id/complete', requireAuth, reviewController.completeReview);

export default router;
