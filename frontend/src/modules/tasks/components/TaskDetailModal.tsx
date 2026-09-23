import { useState } from 'react'
import type { Task, TaskStatus, TaskPriority } from '../types/task.types'
import type { TeamMember } from '../../teams/types/team.types'
import { taskService } from '../services/taskService'
import { useAuth } from '../../../context/AuthContext'
import CommentList from '../../comments/components/CommentList'

interface TaskDetailModalProps {
  task: Task | null
  teamMembers: TeamMember[]
  onClose: () => void
  onTaskUpdated: () => void
}

export default function TaskDetailModal({ task, teamMembers, onClose, onTaskUpdated }: TaskDetailModalProps) {
  const { user } = useAuth()
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'TODO')
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'MEDIUM')
  const [assigneeId, setAssigneeId] = useState<string>(task?.assigneeId ?? '')
  const [confirmDelete, setConfirmDelete] = useState(false)

  const [saving, setSaving] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!task) return null

  const actor = user ? { id: user.id, name: user.name } : undefined

  const handleStatusChange = async (newStatus: TaskStatus) => {
    setStatus(newStatus)
    setSaving(true)
    setErrorMsg('')
    try {
      await taskService.updateTaskStatus(task.id, newStatus, actor)
      onTaskUpdated()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update status.')
    } finally {
      setSaving(false)
    }
  }

  const handlePriorityChange = async (newPriority: TaskPriority) => {
    setPriority(newPriority)
    setSaving(true)
    setErrorMsg('')
    try {
      await taskService.updateTask(task.id, { priority: newPriority }, actor)
      onTaskUpdated()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update priority.')
    } finally {
      setSaving(false)
    }
  }

  const handleReassign = async (newAssigneeId: string) => {
    setAssigneeId(newAssigneeId)
    const member = teamMembers.find((m) => m.userId === newAssigneeId)
    if (!member) return

    setSaving(true)
    setErrorMsg('')
    try {
      await taskService.assignTask(task.id, member.userId, member.name, actor)
      onTaskUpdated()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to reassign member.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setSaving(true)
    setErrorMsg('')
    try {
      await taskService.deleteTask(task.id, actor)
      onTaskUpdated()
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete task.')
      setSaving(false)
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
          maxWidth: '640px',
          width: '100%',
          backgroundColor: 'var(--bg-secondary)',
          border: '1px solid var(--border-color)',
          borderRadius: '0.75rem',
          padding: '2rem',
          position: 'relative',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
        >
          &times;
        </button>

        {/* Task Title & Tag */}
        <div style={{ marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="skill-tag" style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}>
              {task.module}
            </span>
            <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
              Created {new Date(task.createdAt).toLocaleDateString()}
            </span>
          </div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {task.title}
          </h2>
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.625rem 0.875rem', borderRadius: '0.375rem', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
            {errorMsg}
          </div>
        )}

        {/* Description */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em', marginBottom: '0.35rem' }}>
            Description
          </h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.925rem', lineHeight: 1.5, margin: 0 }}>
            {task.description}
          </p>
        </div>

        {/* Quick Management Controls Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '0.5rem' }}>
          {/* Status Control */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status Column</label>
            <select
              value={status}
              onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
              disabled={saving}
              className="search-input"
              style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', width: '100%' }}
            >
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="REVIEW">In Review</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Priority Control */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Priority Level</label>
            <select
              value={priority}
              onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
              disabled={saving}
              className="search-input"
              style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', width: '100%' }}
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
          </div>

          {/* Reassign Member Control */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', gridColumn: 'span 2' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Assigned Team Member</label>
            <select
              value={assigneeId}
              onChange={(e) => handleReassign(e.target.value)}
              disabled={saving}
              className="search-input"
              style={{ padding: '0.4rem 0.6rem', fontSize: '0.85rem', width: '100%' }}
            >
              {teamMembers.map((member) => (
                <option key={member.userId} value={member.userId}>
                  {member.name} ({member.usn}) - {member.role === 'TEAM_LEAD' ? 'Lead' : 'Member'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Comments */}
        <div
          style={{
            marginBottom: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-color)'
          }}
        >
          <CommentList taskId={task.id} />
        </div>

        {/* Delete Confirmation or Actions Footer */}
        {confirmDelete ? (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.85rem', color: '#ef4444', fontWeight: 600 }}>Confirm task deletion?</span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button onClick={() => setConfirmDelete(false)} disabled={saving} className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                Cancel
              </button>
              <button onClick={handleDelete} disabled={saving} className="btn btn-primary" style={{ backgroundColor: '#ef4444', borderColor: '#ef4444', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}>
                {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <button onClick={() => setConfirmDelete(true)} className="btn btn-secondary" style={{ color: '#ef4444', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
              Delete Task
            </button>
            <button onClick={onClose} className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
