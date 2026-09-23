import { useState, useEffect } from 'react'
import type { Submission } from '../types/submission.types'
import { reviewService } from '../../reviews/services/reviewService'
import type { SubmissionReview } from '../../reviews/types/review.types'
interface SubmissionCardProps {
  submission: Submission
  onEdit?: (submission: Submission) => void
  onSubmit?: (submission: Submission) => void
  submitting?: boolean
}

function formatDate(isoString?: string): string {
  if (!isoString) return ''
  const d = new Date(isoString)
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

function getStatusBadge(status: Submission['status']) {
  switch (status) {
    case 'DRAFT':
      return <span className="badge badge-warning">Draft</span>
    case 'SUBMITTED':
      return <span className="badge badge-info">Submitted</span>
    case 'UNDER_REVIEW':
      return <span className="badge badge-warning">Under Review</span>
    case 'REVIEWED':
      return <span className="badge badge-success">Reviewed</span>
    default:
      return <span className="badge badge-muted">{status}</span>
  }
}

export default function SubmissionCard({
  submission,
  onEdit,
  onSubmit,
  submitting = false
}: SubmissionCardProps) {
  const isDraft = submission.status === 'DRAFT'
  const isReviewedOrUnderReview = submission.status === 'UNDER_REVIEW' || submission.status === 'REVIEWED'

  const [review, setReview] = useState<SubmissionReview | null>(null)

  useEffect(() => {
    let active = true
    if (isReviewedOrUnderReview) {
      reviewService.getReviewForSubmission(submission.id).then((rev) => {
        if (active && rev) {
          setReview(rev)
        }
      })
    }
    return () => {
      active = false
    }
  }, [submission.id, isReviewedOrUnderReview])

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        transition: 'border-color 0.2s ease',
        position: 'relative'
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.5rem',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                color: 'var(--accent-primary)',
                borderRadius: '0.375rem',
                border: '1px solid rgba(99, 102, 241, 0.3)'
              }}
            >
              v{submission.version}
            </span>
            {getStatusBadge(submission.status)}
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              By <strong style={{ color: 'var(--text-secondary)' }}>{submission.submittedByName}</strong>
            </span>
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
            {submission.title}
          </h3>
        </div>

        {/* Action Buttons for Draft */}
        {isDraft && (
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(submission)}
                disabled={submitting}
                className="btn btn-secondary"
                style={{ padding: '0.45rem 0.875rem', fontSize: '0.85rem' }}
              >
                ✏️ Edit Draft
              </button>
            )}
            {onSubmit && (
              <button
                type="button"
                onClick={() => onSubmit(submission)}
                disabled={submitting}
                className="btn btn-primary"
                style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
              >
                {submitting ? 'Submitting...' : '🚀 Submit Deliverable'}
              </button>
            )}
          </div>
        )}

        {!isDraft && (
          <div
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-muted)',
              backgroundColor: 'var(--bg-tertiary)',
              padding: '0.35rem 0.75rem',
              borderRadius: '0.375rem',
              border: '1px solid var(--border-color)'
            }}
          >
            🔒 Formal Submission Locked
          </div>
        )}
      </div>

      {/* Description Content */}
      <div
        style={{
          color: 'var(--text-secondary)',
          fontSize: '0.95rem',
          lineHeight: 1.6,
          whiteSpace: 'pre-wrap',
          backgroundColor: 'var(--bg-tertiary)',
          padding: '1rem',
          borderRadius: '0.5rem',
          border: '1px solid rgba(255, 255, 255, 0.04)'
        }}
      >
        {submission.description}
      </div>

      {/* Review Section */}
      {isReviewedOrUnderReview && (
        <div
          style={{
            marginTop: '0.5rem',
            padding: '1.25rem',
            backgroundColor: submission.status === 'REVIEWED' ? 'rgba(16, 185, 129, 0.05)' : 'rgba(245, 158, 11, 0.05)',
            border: `1px solid ${submission.status === 'REVIEWED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`,
            borderRadius: '0.75rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Mentor Review
            </h4>
            {review && (
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Reviewer: <strong style={{ color: 'var(--text-secondary)' }}>{review.reviewerName}</strong>
              </span>
            )}
          </div>
          
          {submission.status === 'UNDER_REVIEW' && (
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Your submission is currently being reviewed by your mentor. Feedback will appear here once the review is completed or updated.
            </p>
          )}

          {review?.feedback && (
            <div
              style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)',
                whiteSpace: 'pre-wrap',
                lineHeight: 1.5,
                marginTop: submission.status === 'UNDER_REVIEW' ? '1rem' : 0
              }}
            >
              <strong>Feedback:</strong>
              <div style={{ marginTop: '0.5rem' }}>{review.feedback}</div>
            </div>
          )}
          
          {submission.status === 'REVIEWED' && !review?.feedback && (
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Mentor feedback is available.
            </p>
          )}
        </div>
      )}

      {/* Timestamp Footer */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
          fontSize: '0.75rem',
          color: 'var(--text-muted)',
          borderTop: '1px solid var(--border-color)',
          paddingTop: '0.75rem'
        }}
      >
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <span>Created: {formatDate(submission.createdAt)}</span>
          {submission.updatedAt !== submission.createdAt && (
            <span>Updated: {formatDate(submission.updatedAt)}</span>
          )}
        </div>

        {submission.submittedAt && (
          <div style={{ color: 'var(--info)' }}>
            Submitted at: {formatDate(submission.submittedAt)}
          </div>
        )}
      </div>
    </div>
  )
}
