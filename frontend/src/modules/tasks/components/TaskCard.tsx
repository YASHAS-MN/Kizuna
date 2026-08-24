import type { Task, TaskPriority } from '../types/task.types'

interface TaskCardProps {
  task: Task
  onSelect: (task: Task) => void
}

export default function TaskCard({ task, onSelect }: TaskCardProps) {
  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case 'CRITICAL':
        return <span className="badge" style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.4)' }}>CRITICAL</span>
      case 'HIGH':
        return <span className="badge badge-warning">HIGH</span>
      case 'MEDIUM':
        return <span className="badge badge-info">MEDIUM</span>
      case 'LOW':
        return <span className="badge" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>LOW</span>
      default:
        return <span className="badge badge-info">{priority}</span>
    }
  }

  return (
    <div
      onClick={() => onSelect(task)}
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '0.625rem',
        padding: '1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        cursor: 'pointer',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
        transition: 'transform 0.15s ease, border-color 0.15s ease'
      }}
    >
      {/* Top Bar: Module Tag + Priority Badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span className="skill-tag" style={{ fontSize: '0.75rem', borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}>
          {task.module}
        </span>
        {getPriorityBadge(task.priority)}
      </div>

      {/* Task Title & Description Preview */}
      <div>
        <h4 style={{ fontSize: '0.975rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.35rem', lineHeight: 1.3 }}>
          {task.title}
        </h4>
        <p
          style={{
            fontSize: '0.825rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.4,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {task.description}
        </p>
      </div>

      {/* Footer Bar: Assignee + Due Date */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', fontSize: '0.775rem', color: 'var(--text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
          <span style={{ width: '1.25rem', height: '1.25rem', borderRadius: '9999px', background: 'var(--accent-gradient)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700, color: 'white' }}>
            {task.assigneeName.split(' ').map((n) => n[0]).join('')}
          </span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{task.assigneeName}</span>
        </div>

        {task.dueDate && (
          <span>📅 {new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
        )}
      </div>
    </div>
  )
}
