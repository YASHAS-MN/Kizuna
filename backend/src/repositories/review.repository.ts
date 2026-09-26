import { Review } from '../models/review.js';

export interface ReviewRepository {
  findBySubmissionId(submissionId: string): Promise<Review | null>;
  findById(id: string): Promise<Review | null>;
  create(review: Review): Promise<Review>;
  update(id: string, updates: Partial<Review>): Promise<Review | null>;
}
