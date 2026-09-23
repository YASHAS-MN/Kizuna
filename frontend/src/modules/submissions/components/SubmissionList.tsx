import type { Submission } from '../types/submission.types'
import SubmissionCard from './SubmissionCard'

interface SubmissionListProps {
  submissions: Submission[]
  onEdit: (submission: Submission) => void
  onSubmit: (submission: Submission) => void
  onCreateFirst?: () => void
  submittingId?: string | null
}

export default function SubmissionList({
  submissions,
  onEdit,
  onSubmit,
  onCreateFirst,
  submittingId
}: SubmissionListProps) {
  if (submissions.length === 0) {
    return (
      <div
        className="module-card"
        style={{
          cursor: 'default',
          textAlign: 'center',
          padding: '3.5rem 2rem',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <div
          className="module-icon-wrapper"
          style={{
            margin: '0 auto 1.25rem auto',
            width: '3.5rem',
            height: '3.5rem',
            fontSize: '1.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          📤
        </div>
        <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          No Submissions Yet
        </h3>
        <p
          style={{
            color: 'var(--text-muted)',
            fontSize: '0.95rem',
            maxWidth: '480px',
            margin: '0 auto 1.5rem auto'
          }}
        >
          Formal deliverables, progress reports, and milestone artifacts for this project workspace will be listed here.
        </p>
        {onCreateFirst && (
          <button type="button" onClick={onCreateFirst} className="btn btn-primary">
            + Create First Draft
          </button>
        )}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {submissions.map((submission) => (
        <SubmissionCard
          key={submission.id}
          submission={submission}
          onEdit={onEdit}
          onSubmit={onSubmit}
          submitting={submittingId === submission.id}
        />
      ))}
    </div>
  )
}
