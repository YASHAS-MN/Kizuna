import type { SubmissionReview } from '../types/review.types'
import {
  fetchReviewForSubmissionApi,
  startReviewApi,
  updateFeedbackApi,
  completeReviewApi
} from '../../../services/api/reviews'
import { submissionService } from '../../submissions/services/submissionService'

type Listener = () => void
const listeners: Set<Listener> = new Set()

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener()
    } catch (err) {
      console.error('Error in reviewService listener:', err)
    }
  })
}

export const reviewService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  async getReviewForSubmission(submissionId: string): Promise<SubmissionReview | null> {
    return await fetchReviewForSubmissionApi(submissionId)
  },

  async startReview(
    submissionId: string,
    // reviewer is now resolved on the backend via session identity
    _reviewer?: { id: string; name: string }
  ): Promise<SubmissionReview> {
    const review = await startReviewApi(submissionId)
    // Refetch submissions to update their status in the UI
    await submissionService.getSubmission(submissionId)
    notifyListeners()
    return review
  },

  async updateFeedback(
    reviewId: string,
    feedback: string,
    _reviewerId?: string
  ): Promise<SubmissionReview> {
    const updated = await updateFeedbackApi(reviewId, feedback)
    notifyListeners()
    return updated
  },

  async completeReview(reviewId: string, _reviewerId?: string): Promise<SubmissionReview> {
    const completed = await completeReviewApi(reviewId)
    // Refetch submissions to update their status in the UI
    await submissionService.getSubmission(completed.submissionId)
    notifyListeners()
    return completed
  }
}
