export type ReviewStatus = 'IN_REVIEW' | 'REVIEWED'

export interface SubmissionReview {
  id: string
  submissionId: string
  projectId: string
  reviewerId: string
  reviewerName: string
  feedback: string
  status: ReviewStatus
  createdAt: string
  updatedAt: string
  reviewedAt?: string
}
