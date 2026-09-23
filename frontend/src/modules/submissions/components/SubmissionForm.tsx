import React, { useState } from 'react'
import type { Submission } from '../types/submission.types'

interface SubmissionFormProps {
  initialSubmission?: Submission | null
  onClose: () => void
  onSubmit: (data: { title: string; description: string }) => Promise<void>
}

export default function SubmissionForm({
  initialSubmission,
  onClose,
  onSubmit
}: SubmissionFormProps) {
  const isEditing = Boolean(initialSubmission)
  const [title, setTitle] = useState(initialSubmission?.title || '')
  const [description, setDescription] = useState(initialSubmission?.description || '')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!title.trim()) {
      setErrorMsg('Submission title is required.')
      return
    }

    if (!description.trim()) {
      setErrorMsg('Submission description is required.')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        title: title.trim(),
        description: description.trim()
      })
      onClose()
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message)
      } else {
        setErrorMsg('Failed to save submission draft.')
      }
      setSubmitting(false)
    }
  }

  return (
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
      onClick={onClose}
    >
      <div
        style={{
          maxWidth: '560px',
          width: '100%',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '0.875rem',
          padding: '2rem',
          position: 'relative',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
              {isEditing ? 'Edit Submission Draft' : 'New Project Deliverable'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {isEditing
                ? 'Update draft contents prior to final submission.'
                : 'Prepare a formal milestone deliverable or project report.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '1.5rem',
              cursor: 'pointer',
              lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        {errorMsg && (
          <div
            style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '0.5rem',
              color: '#ef4444',
              fontSize: '0.875rem',
              marginBottom: '1.25rem'
            }}
          >
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label
              htmlFor="submission-title"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '0.35rem'
              }}
            >
              Deliverable Title <span style={{ color: 'var(--accent-primary)' }}>*</span>
            </label>
            <input
              id="submission-title"
              type="text"
              className="search-input"
              style={{ width: '100%' }}
              placeholder="e.g. Milestone 2: Technical Architecture & API Documentation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="submission-description"
              style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--text-secondary)',
                marginBottom: '0.35rem'
              }}
            >
              Description & Summary <span style={{ color: 'var(--accent-primary)' }}>*</span>
            </label>
            <textarea
              id="submission-description"
              className="search-input"
              style={{ width: '100%', minHeight: '130px', resize: 'vertical' }}
              placeholder="Summarize the work delivered, verification steps, and milestone deliverables..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn btn-primary"
            >
              {submitting
                ? 'Saving...'
                : isEditing
                ? 'Save Changes'
                : 'Create Draft'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
