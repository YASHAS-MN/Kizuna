import type { ActivityEvent } from '../types/activity.types'

interface ActivityItemProps {
  event: ActivityEvent
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

function typeLabel(type: ActivityEvent['type']): string {
  switch (type) {
    case 'TASK_CREATED':
      return 'Task'
    case 'TASK_ASSIGNED':
    case 'TASK_REASSIGNED':
      return 'Assignment'
    case 'TASK_STATUS_CHANGED':
      return 'Status'
    case 'TASK_PRIORITY_CHANGED':
      return 'Priority'
    case 'TASK_DELETED':
      return 'Task'
    case 'PROJECT_CREATED':
      return 'Project'
    case 'TEAM_MEMBER_ADDED':
    case 'TEAM_MEMBER_REMOVED':
    case 'TEAM_MEMBER_ROLE_CHANGED':
      return 'Team'
    case 'COMMENT_ADDED':
    case 'COMMENT_DELETED':
      return 'Comment'
    case 'SUBMISSION_CREATED':
    case 'SUBMISSION_UPDATED':
    case 'SUBMISSION_SUBMITTED':
      return 'Submission'
    default:
      return 'Event'
  }
}

export default function ActivityItem({ event }: ActivityItemProps) {
  const initials = event.actorName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  return (
    <div
      style={{
        display: 'flex',
        gap: '0.875rem',
        padding: '0.875rem 0'
      }}
    >
      <div
        style={{
          width: '2.25rem',
          height: '2.25rem',
          borderRadius: '9999px',
          background: 'var(--accent-gradient)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'white',
          flexShrink: 0
        }}
      >
        {initials || '?'}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.2rem' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.925rem' }}>
            {event.actorName}
          </span>
          <span className="badge badge-muted" style={{ fontSize: '0.7rem' }}>
            {typeLabel(event.type)}
          </span>
        </div>
        <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.45 }}>
          {event.message}
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.35rem', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
          <span>{formatTime(event.createdAt)}</span>
          {event.taskId && <span>Task {event.taskId}</span>}
          {event.submissionId && <span>Deliverable {event.submissionId}</span>}
        </div>
      </div>
    </div>
  )
}
