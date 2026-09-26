import { ReviewRepository } from '../repositories/review.repository.js';
import { SubmissionService } from './submission.service.js';
import { Review } from '../models/review.js';

export class ReviewService {
  constructor(
    private reviewRepository: ReviewRepository,
    private submissionService: SubmissionService
  ) {}

  async getReviewForSubmission(submissionId: string): Promise<Review | null> {
    return this.reviewRepository.findBySubmissionId(submissionId);
  }

  async getReviewById(id: string): Promise<Review | null> {
    return this.reviewRepository.findById(id);
  }

  async startReview(review: Review): Promise<Review> {
    const created = await this.reviewRepository.create(review);
    await this.submissionService.updateSubmissionStatus(review.submissionId, 'UNDER_REVIEW');
    return created;
  }

  async updateFeedback(id: string, feedback: string): Promise<Review | null> {
    return this.reviewRepository.update(id, { feedback, updatedAt: new Date().toISOString() });
  }

  async completeReview(id: string): Promise<Review | null> {
    const now = new Date().toISOString();
    const review = await this.reviewRepository.update(id, { status: 'REVIEWED', updatedAt: now, reviewedAt: now });
    if (review) {
      await this.submissionService.updateSubmissionStatus(review.submissionId, 'REVIEWED');
    }
    return review;
  }
}
