import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import type { Submission } from '../types/submission.types'
import { submissionService } from '../services/submissionService'
import { useAuth } from '../../../context/AuthContext'
import SubmissionList from '../components/SubmissionList'
import SubmissionForm from '../components/SubmissionForm'

interface SubmissionsPageProps {
  projectId?: string
}

export default function SubmissionsPage({ projectId: propProjectId }: SubmissionsPageProps) {
  const { projectId: routeProjectId } = useParams<{ projectId: string }>()
  const projectId = propProjectId || routeProjectId
  const { user } = useAuth()

  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [actionError, setActionError] = useState('')

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [editingSubmission, setEditingSubmission] = useState<Submission | null>(null)
  const [confirmSubmitSubmission, setConfirmSubmitSubmission] = useState<Submission | null>(null)
  const [submittingId, setSubmittingId] = useState<string | null>(null)

  const loadSubmissions = useCallback(async () => {
    if (!projectId) {
      setErrorMsg('A valid project ID is required to load submissions.')
      setLoading(false)
      return
    }

    try {
      setErrorMsg('')
      const data = await submissionService.getSubmissionsForProject(projectId)
      setSubmissions(data)
    } catch (err) {
      console.error('Failed to load project submissions:', err)
      setErrorMsg('Failed to load project deliverables.')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    setLoading(true)
    loadSubmissions()

    const unsubscribe = submissionService.subscribe(() => {
      loadSubmissions()
    })

    return () => {
      unsubscribe()
    }
  }, [loadSubmissions])

  const handleCreateDraft = async (data: { title: string; description: string }) => {
    if (!projectId) return
    setActionError('')
    await submissionService.createSubmission(
      {
        projectId,
        title: data.title,
        description: data.description,
        submittedBy: user?.id || 'system',
        submittedByName: user?.name || 'System User'
      },
      user ? { id: user.id, name: user.name } : undefined
    )
  }

  const handleUpdateDraft = async (data: { title: string; description: string }) => {
    if (!editingSubmission) return
    setActionError('')
    await submissionService.updateSubmission(
      editingSubmission.id,
      {
        title: data.title,
        description: data.description
      },
      user ? { id: user.id, name: user.name } : undefined
    )
    setEditingSubmission(null)
  }

  const handleConfirmSubmit = async () => {
    if (!confirmSubmitSubmission) return
    setActionError('')
    setSubmittingId(confirmSubmitSubmission.id)
    try {
      await submissionService.submitSubmission(
        confirmSubmitSubmission.id,
        user ? { id: user.id, name: user.name } : undefined
      )
      setConfirmSubmitSubmission(null)
    } catch (err: unknown) {
      if (err instanceof Error) {
        setActionError(err.message)
      } else {
        setActionError('Failed to submit deliverable.')
      }
    } finally {
      setSubmittingId(null)
    }
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        Loading project deliverables and submissions...
      </div>
    )
  }

  if (errorMsg || !projectId) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '3rem 1.5rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '0.75rem',
          border: '1px solid var(--border-color)'
        }}
      >
        <h2 style={{ fontSize: '1.25rem', color: '#ef4444', marginBottom: '0.5rem' }}>
          {errorMsg || 'Project not found'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          Unable to access deliverables repository for this workspace.
        </p>
        <button type="button" onClick={() => loadSubmissions()} className="btn btn-secondary">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="page-title" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
            Deliverables & Submissions
          </h2>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Formal milestone reports and project deliverable records.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setActionError('')
            setShowCreateModal(true)
          }}
          className="btn btn-primary"
        >
          + New Submission Draft
        </button>
      </div>

      {actionError && (
        <div
          style={{
            padding: '0.75rem 1rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '0.5rem',
            color: '#ef4444',
            fontSize: '0.875rem'
          }}
        >
          {actionError}
        </div>
      )}

      {/* Submissions List */}
      <SubmissionList
        submissions={submissions}
        onEdit={(sub) => setEditingSubmission(sub)}
        onSubmit={(sub) => setConfirmSubmitSubmission(sub)}
        onCreateFirst={() => setShowCreateModal(true)}
        submittingId={submittingId}
      />

      {/* Create Modal */}
      {showCreateModal && (
        <SubmissionForm
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateDraft}
        />
      )}

      {/* Edit Modal */}
      {editingSubmission && (
        <SubmissionForm
          key={editingSubmission.id}
          initialSubmission={editingSubmission}
          onClose={() => setEditingSubmission(null)}
          onSubmit={handleUpdateDraft}
        />
      )}

      {/* Confirm Submission Modal */}
      {confirmSubmitSubmission && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1.5rem'
          }}
          onClick={() => setConfirmSubmitSubmission(null)}
        >
          <div
            style={{
              maxWidth: '480px',
              width: '100%',
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-color)',
              borderRadius: '0.875rem',
              padding: '1.75rem',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Submit Deliverable for Review?
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.5, marginBottom: '1.25rem' }}>
              Are you sure you want to formally submit <strong>"{confirmSubmitSubmission.title}"</strong> (v{confirmSubmitSubmission.version})?
              Once submitted, student editing is locked and this milestone will be queued for mentor evaluation.
            </p>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setConfirmSubmitSubmission(null)}
                disabled={Boolean(submittingId)}
                className="btn btn-secondary"
              >
                Keep as Draft
              </button>
              <button
                type="button"
                onClick={handleConfirmSubmit}
                disabled={Boolean(submittingId)}
                className="btn btn-primary"
              >
                {submittingId ? 'Submitting...' : 'Confirm Submission'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
