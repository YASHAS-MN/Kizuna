import { Response, NextFunction } from 'express';
import { ReviewService } from '../services/review.service.js';
import { SubmissionService } from '../services/submission.service.js';
import { AuthorizationService } from '../services/authorization.service.js';
import { ActivityService } from '../services/activity.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class ReviewController {
  constructor(
    private reviewService: ReviewService,
    private submissionService: SubmissionService,
    private authService: AuthorizationService,
    private activityService: ActivityService
  ) {}

  getReviewForSubmission = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { submissionId } = req.params;
      const user = req.user!;
      
      if (!(await this.authService.canAccessSubmission(user, submissionId))) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
      }

      const review = await this.reviewService.getReviewForSubmission(submissionId);
      if (!review) {
        return res.status(404).json({ status: 'error', message: 'Review not found' });
      }
      res.status(200).json(review);
    } catch (error) {
      next(error);
    }
  };

  startReview = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { submissionId } = req.params;
      const user = req.user!;

      if (!(await this.authService.canReviewSubmission(user, submissionId))) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
      }

      const submission = await this.submissionService.getSubmissionById(submissionId);
      if (!submission) {
        return res.status(404).json({ status: 'error', message: 'Submission not found' });
      }

      if (submission.status !== 'SUBMITTED') {
        return res.status(400).json({ status: 'error', message: 'Can only start review for SUBMITTED submissions.' });
      }

      const existing = await this.reviewService.getReviewForSubmission(submissionId);
      if (existing) {
        return res.status(400).json({ status: 'error', message: 'A review already exists for this submission.' });
      }

      const now = new Date().toISOString();
      const newReview = {
        id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        submissionId,
        projectId: submission.projectId,
        reviewerId: user.id,
        reviewerName: user.name,
        feedback: '',
        status: 'IN_REVIEW' as const,
        createdAt: now,
        updatedAt: now
      };

      const created = await this.reviewService.startReview(newReview);

      await this.activityService.createActivity({
        id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        projectId: submission.projectId,
        actorId: user.id,
        actorName: user.name,
        type: 'SUBMISSION_REVIEW_STARTED',
        message: `started reviewing submission "${submission.title}" (v${submission.version})`,
        submissionId: created.submissionId,
        createdAt: now,
        metadata: { reviewId: created.id }
      });

      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  };

  updateFeedback = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = req.user!;
      const { feedback } = req.body;

      if (feedback === undefined) {
         return res.status(400).json({ status: 'error', message: 'feedback is required' });
      }

      if (!(await this.authService.canModifyReview(user, id))) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
      }

      const existing = await this.reviewService.getReviewById(id);
      if (!existing) {
        return res.status(404).json({ status: 'error', message: 'Review not found' });
      }

      if (existing.reviewerId !== user.id) {
         return res.status(403).json({ status: 'error', message: 'Only the assigned reviewer can update feedback.' });
      }

      if (existing.status !== 'IN_REVIEW') {
        return res.status(400).json({ status: 'error', message: 'Cannot update feedback for a completed review.' });
      }

      const cleanFeedback = String(feedback).trim();
      if (!cleanFeedback) {
        return res.status(400).json({ status: 'error', message: 'Feedback cannot be empty.' });
      }

      const updated = await this.reviewService.updateFeedback(id, cleanFeedback);

      const now = new Date().toISOString();
      await this.activityService.createActivity({
        id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        projectId: existing.projectId,
        actorId: user.id,
        actorName: user.name,
        type: 'SUBMISSION_FEEDBACK_UPDATED',
        message: `updated feedback for submission`,
        submissionId: existing.submissionId,
        createdAt: now,
        metadata: { reviewId: existing.id }
      });

      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  };

  completeReview = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = req.user!;

      if (!(await this.authService.canModifyReview(user, id))) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
      }

      const existing = await this.reviewService.getReviewById(id);
      if (!existing) {
        return res.status(404).json({ status: 'error', message: 'Review not found' });
      }

      if (existing.reviewerId !== user.id) {
         return res.status(403).json({ status: 'error', message: 'Only the assigned reviewer can complete the review.' });
      }

      if (existing.status !== 'IN_REVIEW') {
        return res.status(400).json({ status: 'error', message: 'Review is already completed.' });
      }
      
      if (!existing.feedback.trim()) {
        return res.status(400).json({ status: 'error', message: 'Feedback is required to complete the review.' });
      }

      const completed = await this.reviewService.completeReview(id);

      const now = new Date().toISOString();
      await this.activityService.createActivity({
        id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        projectId: existing.projectId,
        actorId: user.id,
        actorName: user.name,
        type: 'SUBMISSION_REVIEWED',
        message: `completed review for submission`,
        submissionId: existing.submissionId,
        createdAt: now,
        metadata: { reviewId: existing.id }
      });

      res.status(200).json(completed);
    } catch (error) {
      next(error);
    }
  };
}
