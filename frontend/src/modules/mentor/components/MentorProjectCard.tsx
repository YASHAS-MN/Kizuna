import { useNavigate } from 'react-router-dom'
import type { MentorProjectView } from '../types/mentor.types'

interface MentorProjectCardProps {
  projectView: MentorProjectView
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'ACTIVE':
      return <span className="badge badge-success">ACTIVE</span>
    case 'PLANNING':
      return <span className="badge badge-info">PLANNING</span>
    case 'COMPLETED':
      return <span className="badge badge-warning">COMPLETED</span>
    case 'ARCHIVED':
      return (
        <span className="badge" style={{ backgroundColor: 'rgba(156, 163, 175, 0.15)', color: 'var(--text-muted)', border: '1px solid rgba(156, 163, 175, 0.2)' }}>
          ARCHIVED
        </span>
      )
    default:
      return <span className="badge badge-info">{status}</span>
  }
}

/**
 * Read-only project card for the Mentor Dashboard.
 * Shows project name, team name, status badge, and derived progress bar.
 * Progress comes from progressService via MentorProjectView — no separate field.
 * Links to the mentor team detail page rather than the student project workspace.
 */
export default function MentorProjectCard({ projectView }: MentorProjectCardProps) {
  const navigate = useNavigate()
  const { project, teamName, progress } = projectView
  const completionPct = progress.overall.completionPercentage

  // Determine progress bar colour by completion level
  const barColor =
    completionPct >= 75
      ? '#10b981'
      : completionPct >= 40
        ? '#6366f1'
        : '#f59e0b'

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '0.875rem',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        transition: 'border-color 0.2s ease, transform 0.2s ease'
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'var(--accent-primary)'
        el.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'var(--border-color)'
        el.style.transform = 'translateY(0)'
      }}
    >
      {/* Card Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
          {getStatusBadge(project.status)}
        </div>
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--text-primary)',
            margin: 0,
            lineHeight: 1.4
          }}
        >
          {project.name}
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
          Team: <strong style={{ color: 'var(--text-secondary)' }}>{teamName}</strong>
        </p>
      </div>

      {/* Progress Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Progress
          </span>
          <span
            style={{
              fontSize: '0.85rem',
              fontWeight: 700,
              color: barColor,
              fontFamily: 'var(--font-display)'
            }}
          >
            {completionPct}%
          </span>
        </div>
        {/* Progress bar — sourced from progressService, not a stored field */}
        <div
          style={{
            width: '100%',
            height: '6px',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '9999px',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${completionPct}%`,
              backgroundColor: barColor,
              borderRadius: '9999px',
              transition: 'width 0.4s ease'
            }}
          />
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
          {progress.overall.completedTasks} of {progress.overall.totalTasks} tasks completed
        </p>
      </div>

      {/* Action — navigates to mentor team view, not student workspace */}
      <button
        id={`mentor-project-view-${project.id}`}
        onClick={() => navigate(`/mentor/teams/${project.teamId}`)}
        className="btn btn-secondary"
        style={{ width: '100%', padding: '0.6rem', fontSize: '0.875rem' }}
      >
        View Team →
      </button>
    </div>
  )
}
