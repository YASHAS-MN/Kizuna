import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { submissionService } from '../../submissions/services/submissionService'
import { reviewService } from '../services/reviewService'
import { projectService } from '../../projects/services/projectService'
import type { Submission } from '../../submissions/types/submission.types'
import type { SubmissionReview } from '../types/review.types'

export default function SubmissionReviewPage() {
  const { submissionId } = useParams<{ submissionId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [submission, setSubmission] = useState<Submission | null>(null)
  const [review, setReview] = useState<SubmissionReview | null>(null)
  const [feedbackInput, setFeedbackInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const loadData = useCallback(async () => {
    if (!submissionId || !user) return
    try {
      setErrorMsg('')
      
      const subData = await submissionService.getSubmission(submissionId)
      if (!subData) {
        setErrorMsg('Submission not found.')
        return
      }

      // Ensure mentor is assigned to the project
      const projectData = await projectService.getProject(subData.projectId)
      if (projectData?.mentorId !== user.id) {
        setErrorMsg('You are not assigned to review this project.')
        return
      }

      setSubmission(subData)

      if (subData.status === 'UNDER_REVIEW' || subData.status === 'REVIEWED') {
        const revData = await reviewService.getReviewForSubmission(submissionId)
        setReview(revData)
        if (revData && subData.status === 'UNDER_REVIEW') {
          setFeedbackInput(revData.feedback)
        }
      }
    } catch (err) {
      console.error('Failed to load submission review data:', err)
      setErrorMsg('Failed to load submission details.')
    } finally {
      setLoading(false)
    }
  }, [submissionId, user])

  useEffect(() => {
    setLoading(true)
    loadData()

    const unsubSub = submissionService.subscribe(() => loadData())
    const unsubRev = reviewService.subscribe(() => loadData())

    return () => {
      unsubSub()
      unsubRev()
    }
  }, [loadData])

  const handleStartReview = async () => {
    if (!submissionId || !user) return
    setActionLoading(true)
    setErrorMsg('')
    try {
      await reviewService.startReview(submissionId, { id: user.id, name: user.name })
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to start review.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleSaveFeedback = async () => {
    if (!review || !user) return
    setActionLoading(true)
    setErrorMsg('')
    try {
      await reviewService.updateFeedback(review.id, feedbackInput, user.id)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save feedback.')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCompleteReview = async () => {
    if (!review || !user) return
    setActionLoading(true)
    setErrorMsg('')
    try {
      // Auto-save feedback if changed before completing
      if (feedbackInput !== review.feedback) {
        await reviewService.updateFeedback(review.id, feedbackInput, user.id)
      }
      await reviewService.completeReview(review.id, user.id)
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to complete review. Please ensure feedback is provided.')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        Loading review details...
      </div>
    )
  }

  if (errorMsg && !submission) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '3rem 1.5rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '0.875rem',
          border: '1px solid var(--border-color)'
        }}
      >
        <h2 style={{ fontSize: '1.25rem', color: '#ef4444', marginBottom: '0.5rem' }}>
          {errorMsg}
        </h2>
        <button onClick={() => navigate('/mentor')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          ← Back to Mentor Dashboard
        </button>
      </div>
    )
  }

  if (!submission) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '0.875rem',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div>
          <span
            className="hero-tagline"
            style={{ margin: 0, fontSize: '0.75rem', display: 'inline-block', marginBottom: '0.5rem' }}
          >
            Mentor Portal — Submission Review
          </span>
          <h1 className="hero-title" style={{ fontSize: '1.75rem', marginBottom: '0.5rem', textAlign: 'left' }}>
            {submission.title}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
            Version {submission.version} • Submitted by {submission.submittedByName}
          </p>
        </div>

        <button
          onClick={() => navigate(`/mentor/projects/${submission.projectId}/submissions`)}
          className="btn btn-secondary"
        >
          ← Back to Project Submissions
        </button>
      </div>

      {errorMsg && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.5rem',
            color: '#ef4444',
            fontSize: '0.9rem'
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* Submission Content (Read Only) */}
      <div>
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '1rem'
          }}
        >
          Submission Content
        </h2>
        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            color: 'var(--text-secondary)',
            fontSize: '0.95rem',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap'
          }}
        >
          {submission.description}
        </div>
        <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Submitted on: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'N/A'}
        </div>
      </div>

      {/* Review Actions / State */}
      <div>
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '1rem'
          }}
        >
          Mentor Review
        </h2>

        {submission.status === 'SUBMITTED' && (
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '0.75rem',
              padding: '2rem',
              textAlign: 'center'
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📝</div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Ready for Review
            </h3>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '500px', margin: '0 auto 1.5rem' }}>
              This submission is waiting for your evaluation. Starting the review will lock the state and notify the team.
            </p>
            <button
              onClick={handleStartReview}
              disabled={actionLoading}
              className="btn btn-primary"
              style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}
            >
              {actionLoading ? 'Starting...' : 'Start Review'}
            </button>
          </div>
        )}

        {submission.status === 'UNDER_REVIEW' && review && (
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--accent-primary)',
              borderRadius: '0.75rem',
              padding: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="badge badge-warning">Under Review</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Started: {new Date(review.createdAt).toLocaleString()}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Your Feedback
              </label>
              <textarea
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                placeholder="Provide constructive feedback for the team..."
                style={{
                  width: '100%',
                  minHeight: '200px',
                  padding: '1rem',
                  backgroundColor: 'var(--bg-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '0.5rem',
                  color: 'var(--text-primary)',
                  fontSize: '0.95rem',
                  resize: 'vertical'
                }}
                disabled={actionLoading}
              />
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '0.5rem' }}>
                <button
                  onClick={handleSaveFeedback}
                  disabled={actionLoading || feedbackInput.trim() === review.feedback}
                  className="btn btn-secondary"
                >
                  {actionLoading ? 'Saving...' : 'Save Draft'}
                </button>
                <button
                  onClick={handleCompleteReview}
                  disabled={actionLoading || !feedbackInput.trim()}
                  className="btn btn-primary"
                >
                  Mark as Reviewed
                </button>
              </div>
            </div>
          </div>
        )}

        {submission.status === 'REVIEWED' && review && (
          <div
            style={{
              backgroundColor: 'rgba(16, 185, 129, 0.05)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '0.75rem',
              padding: '1.5rem'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <span className="badge badge-success">Reviewed</span>
              {review.reviewedAt && (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Completed: {new Date(review.reviewedAt).toLocaleString()}
                </span>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Final Feedback
              </span>
              <div
                style={{
                  fontSize: '0.95rem',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  backgroundColor: 'var(--bg-tertiary)',
                  padding: '1rem',
                  borderRadius: '0.5rem'
                }}
              >
                {review.feedback}
              </div>
            </div>
            
            <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                This review is complete and locked.
              </p>
            </div>
          </div>
        )}

        {submission.status === 'DRAFT' && (
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '0.75rem',
              padding: '2rem',
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}
          >
            Draft submissions cannot be reviewed.
          </div>
        )}
      </div>
    </div>
  )
}
