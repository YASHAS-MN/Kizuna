import type { Task, TaskStatus } from '../types/task.types'
import TaskCard from './TaskCard'

interface TaskBoardProps {
  tasks: Task[]
  onSelectTask: (task: Task) => void
}

const COLUMNS: { status: TaskStatus; label: string; color: string }[] = [
  { status: 'TODO', label: 'To Do', color: 'var(--text-muted)' },
  { status: 'IN_PROGRESS', label: 'In Progress', color: 'var(--accent-primary)' },
  { status: 'REVIEW', label: 'In Review', color: '#f59e0b' },
  { status: 'COMPLETED', label: 'Completed', color: '#10b981' }
]

export default function TaskBoard({ tasks, onSelectTask }: TaskBoardProps) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1.25rem',
        alignItems: 'start'
      }}
    >
      {COLUMNS.map((col) => {
        const columnTasks = tasks.filter((t) => t.status === col.status)
        return (
          <div
            key={col.status}
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '0.75rem',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.875rem',
              minHeight: '400px'
            }}
          >
            {/* Column Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid ' + col.color, paddingBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {col.label}
                </span>
              </div>
              <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                {columnTasks.length}
              </span>
            </div>

            {/* Column Tasks List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
              {columnTasks.length > 0 ? (
                columnTasks.map((task) => (
                  <TaskCard key={task.id} task={task} onSelect={onSelectTask} />
                ))
              ) : (
                <div
                  style={{
                    padding: '2rem 1rem',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: '0.8rem',
                    border: '1px dashed var(--border-color)',
                    borderRadius: '0.5rem'
                  }}
                >
                  No {col.label.toLowerCase()} tasks
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
