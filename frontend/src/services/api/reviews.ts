import { SubmissionReview } from '../../modules/reviews/types/review.types'
import { API_BASE_URL } from './config'

export class UnauthorizedError extends Error {
  constructor(message = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export async function fetchReviewForSubmissionApi(submissionId: string): Promise<SubmissionReview | null> {
  const response = await fetch(`${API_BASE_URL}/submissions/${encodeURIComponent(submissionId)}/review`, {
    credentials: 'include'
  })
  if (response.status === 404) return null
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new UnauthorizedError()
    throw new Error('Failed to fetch review')
  }
  return response.json()
}

export async function startReviewApi(submissionId: string): Promise<SubmissionReview> {
  const response = await fetch(`${API_BASE_URL}/submissions/${encodeURIComponent(submissionId)}/review`, {
    method: 'POST',
    credentials: 'include'
  })
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new UnauthorizedError()
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message || 'Failed to start review')
  }
  return response.json()
}

export async function updateFeedbackApi(reviewId: string, feedback: string): Promise<SubmissionReview> {
  const response = await fetch(`${API_BASE_URL}/reviews/${encodeURIComponent(reviewId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ feedback }),
    credentials: 'include'
  })
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new UnauthorizedError()
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message || 'Failed to update feedback')
  }
  return response.json()
}

export async function completeReviewApi(reviewId: string): Promise<SubmissionReview> {
  const response = await fetch(`${API_BASE_URL}/reviews/${encodeURIComponent(reviewId)}/complete`, {
    method: 'POST',
    credentials: 'include'
  })
  if (!response.ok) {
    if (response.status === 401 || response.status === 403) throw new UnauthorizedError()
    const err = await response.json().catch(() => ({}))
    throw new Error(err.message || 'Failed to complete review')
  }
  return response.json()
}
