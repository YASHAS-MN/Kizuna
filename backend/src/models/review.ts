export type ReviewStatus = 'IN_REVIEW' | 'REVIEWED';

export interface Review {
  id: string;
  submissionId: string;
  projectId: string; // Synthesized from Submission
  reviewerId: string;
  reviewerName: string;
  feedback: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;
}
