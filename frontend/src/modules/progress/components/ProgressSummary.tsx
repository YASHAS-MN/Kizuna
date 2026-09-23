import type { ProgressSummary as ProgressSummaryType } from '../types/progress.types'

interface ProgressSummaryProps {
  summary: ProgressSummaryType
}

export default function ProgressSummary({ summary }: ProgressSummaryProps) {
  const {
    totalTasks,
    completedTasks,
    inProgressTasks,
    reviewTasks,
    todoTasks,
    completionPercentage
  } = summary

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '0.875rem',
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            Overall Project Completion
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Calculated across all active tasks for this workspace
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '2.5rem',
              fontWeight: 700,
              background: 'var(--accent-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              lineHeight: 1
            }}
          >
            {completionPercentage}%
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            ({completedTasks} of {totalTasks} tasks)
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div
        style={{
          width: '100%',
          height: '10px',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: '9999px',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${completionPercentage}%`,
            background: 'var(--accent-gradient)',
            borderRadius: '9999px',
            transition: 'width 0.4s ease'
          }}
        />
      </div>

      {/* Breakdown metrics badges */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '1rem',
          paddingTop: '0.5rem'
        }}
      >
        <div
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '0.625rem',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.375rem',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--success)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Completed
          </span>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {completedTasks}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Finished & verified
          </span>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '0.625rem',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.375rem',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--info)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            In Progress
          </span>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {inProgressTasks}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Active development
          </span>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '0.625rem',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.375rem',
            border: '1px solid rgba(245, 158, 11, 0.2)'
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--warning)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            In Review
          </span>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {reviewTasks}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Pending review
          </span>
        </div>

        <div
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '0.625rem',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.375rem',
            border: '1px solid var(--border-color)'
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            To Do
          </span>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {todoTasks}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Upcoming backlog
          </span>
        </div>
      </div>
    </div>
  )
}
