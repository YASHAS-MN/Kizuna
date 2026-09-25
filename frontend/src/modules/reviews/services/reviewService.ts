import type { SubmissionReview } from '../types/review.types'
import { submissionService } from '../../submissions/services/submissionService'
import { emitActivity } from '../../activity/services/activityService'
import { projectService } from '../../projects/services/projectService'
import { teamService } from '../../teams/services/teamService'
import { authorizationService } from '../../authorization/services/authorizationService'

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

/**
 * In-memory mock reviews store.
 */
let mockReviews: SubmissionReview[] = []

export const reviewService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  async getReviewForSubmission(submissionId: string): Promise<SubmissionReview | null> {
    await new Promise((resolve) => setTimeout(resolve, 80))

    // AUTHORIZATION: verify caller can access the submission
    await submissionService.getSubmission(submissionId) // Throws UnauthorizedError if not permitted

    const item = mockReviews.find((r) => r.submissionId === submissionId)
    return item ? { ...item } : null
  },

  async startReview(
    submissionId: string,
    reviewer: { id: string; name: string }
  ): Promise<SubmissionReview> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    
    const submission = await submissionService.getSubmission(submissionId)
    if (!submission) {
      throw new Error('Submission not found.')
    }

    // AUTHORIZATION: only the assigned mentor may review
    const project = await projectService.getProject(submission.projectId)
    if (!project) throw new Error('Project not found')
    const team = await teamService.getTeam(project.teamId)
    if (!team) throw new Error('Team not found')
    authorizationService.assertCanReviewSubmission(submission, project, team)

    if (submission.status !== 'SUBMITTED') {
      throw new Error('Can only start review for SUBMITTED submissions.')
    }

    const existingReview = mockReviews.find((r) => r.submissionId === submissionId)
    if (existingReview) {
      throw new Error('A review already exists for this submission.')
    }

    const now = new Date().toISOString()
    const newReview: SubmissionReview = {
      id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      submissionId,
      projectId: submission.projectId,
      reviewerId: reviewer.id,
      reviewerName: reviewer.name,
      feedback: '',
      status: 'IN_REVIEW',
      createdAt: now,
      updatedAt: now
    }

    mockReviews.push(newReview)

    // Update submission status
    await submissionService.updateSubmissionStatus(submissionId, 'UNDER_REVIEW')

    emitActivity({
      projectId: newReview.projectId,
      actorId: newReview.reviewerId,
      actorName: newReview.reviewerName,
      type: 'SUBMISSION_REVIEW_STARTED',
      message: `started reviewing submission "${submission.title}" (v${submission.version})`,
      submissionId: newReview.submissionId,
      metadata: { reviewId: newReview.id }
    })

    notifyListeners()
    return { ...newReview }
  },

  async updateFeedback(
    reviewId: string,
    feedback: string,
    reviewerId: string
  ): Promise<SubmissionReview> {
    await new Promise((resolve) => setTimeout(resolve, 100))
    
    const index = mockReviews.findIndex((r) => r.id === reviewId)
    if (index === -1) {
      throw new Error('Review not found.')
    }
    
    const current = mockReviews[index]
    if (current.reviewerId !== reviewerId) {
      throw new Error('Only the assigned reviewer can update feedback.')
    }
    if (current.status !== 'IN_REVIEW') {
      throw new Error('Cannot update feedback for a completed review.')
    }
    if (!feedback.trim()) {
      throw new Error('Feedback cannot be empty.')
    }

    const updated: SubmissionReview = {
      ...current,
      feedback: feedback.trim(),
      updatedAt: new Date().toISOString()
    }
    mockReviews[index] = updated

    emitActivity({
      projectId: updated.projectId,
      actorId: updated.reviewerId,
      actorName: updated.reviewerName,
      type: 'SUBMISSION_FEEDBACK_UPDATED',
      message: `updated feedback for submission`,
      submissionId: updated.submissionId,
      metadata: { reviewId: updated.id }
    })

    notifyListeners()
    return { ...updated }
  },

  async completeReview(reviewId: string, reviewerId: string): Promise<SubmissionReview> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    
    const index = mockReviews.findIndex((r) => r.id === reviewId)
    if (index === -1) {
      throw new Error('Review not found.')
    }
    
    const current = mockReviews[index]
    if (current.reviewerId !== reviewerId) {
      throw new Error('Only the assigned reviewer can complete the review.')
    }
    if (current.status !== 'IN_REVIEW') {
      throw new Error('Review is already completed.')
    }
    if (!current.feedback.trim()) {
      throw new Error('Feedback is required to complete the review.')
    }

    const now = new Date().toISOString()
    const completed: SubmissionReview = {
      ...current,
      status: 'REVIEWED',
      updatedAt: now,
      reviewedAt: now
    }
    mockReviews[index] = completed

    // Update submission status
    await submissionService.updateSubmissionStatus(current.submissionId, 'REVIEWED')

    emitActivity({
      projectId: completed.projectId,
      actorId: completed.reviewerId,
      actorName: completed.reviewerName,
      type: 'SUBMISSION_REVIEWED',
      message: `completed review for submission`,
      submissionId: completed.submissionId,
      metadata: { reviewId: completed.id }
    })

    notifyListeners()
    return { ...completed }
  }
}
