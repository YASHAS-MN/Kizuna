import React, { useState } from 'react'
import type { TaskStatus, TaskPriority } from '../types/task.types'
import type { TeamMember } from '../../teams/types/team.types'
import { taskService } from '../services/taskService'
import { useAuth } from '../../../context/AuthContext'

interface TaskFormProps {
  projectId: string
  teamMembers: TeamMember[]
  onClose: () => void
  onSuccess: () => void
}

export default function TaskForm({ projectId, teamMembers, onClose, onSuccess }: TaskFormProps) {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [module, setModule] = useState('Frontend')
  const [assigneeId, setAssigneeId] = useState(teamMembers[0]?.userId || '')
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM')
  const [status, setStatus] = useState<TaskStatus>('TODO')
  const [dueDate, setDueDate] = useState('')

  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!title.trim()) {
      setErrorMsg('Task title is required.')
      return
    }
    if (!description.trim()) {
      setErrorMsg('Task description is required.')
      return
    }
    if (!module.trim()) {
      setErrorMsg('Module/Responsibility is required.')
      return
    }
    if (!assigneeId) {
      setErrorMsg('Please select a team member as assignee.')
      return
    }

    const selectedAssignee = teamMembers.find((m) => m.userId === assigneeId)
    if (!selectedAssignee) {
      setErrorMsg('Selected assignee is not a valid member of this project team.')
      return
    }

    setSubmitting(true)
    try {
      await taskService.createTask({
        projectId,
        title: title.trim(),
        description: description.trim(),
        module: module.trim(),
        assigneeId: selectedAssignee.userId,
        assigneeName: selectedAssignee.name,
        priority,
        status,
        dueDate: dueDate || undefined,
        actor: user ? { id: user.id, name: user.name } : undefined
      })

      onSuccess()
      onClose()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create task.')
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
          borderRadius: '0.75rem',
          padding: '2rem',
          position: 'relative',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Create New Task
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '1.5rem', cursor: 'pointer' }}
          >
            &times;
          </button>
        </div>

        {errorMsg && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.75rem 1rem', borderRadius: '0.375rem', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Task Title Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Task Title <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Implement User Authentication"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={submitting}
              required
              className="search-input"
              style={{ width: '100%' }}
            />
          </div>

          {/* Description Textarea */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Description <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              rows={3}
              placeholder="Describe task scope, implementation steps, and acceptance criteria..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              required
              className="search-input"
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* Grid: Module Tag & Assignee */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Module / Responsibility <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Frontend, Backend, QA, ML"
                value={module}
                onChange={(e) => setModule(e.target.value)}
                disabled={submitting}
                required
                className="search-input"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Assignee (Team Member) <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                value={assigneeId}
                onChange={(e) => setAssigneeId(e.target.value)}
                disabled={submitting}
                className="search-input"
                style={{ width: '100%', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
              >
                {teamMembers.map((member) => (
                  <option key={member.userId} value={member.userId}>
                    {member.name} ({member.role === 'TEAM_LEAD' ? 'Lead' : 'Member'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Grid: Priority, Initial Status, Due Date */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                disabled={submitting}
                className="search-input"
                style={{ width: '100%', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                disabled={submitting}
                className="search-input"
                style={{ width: '100%', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="REVIEW">In Review</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                disabled={submitting}
                className="search-input"
                style={{ width: '100%', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
              />
            </div>
          </div>

          {/* Form Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} disabled={submitting} className="btn btn-secondary">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="btn btn-primary" style={{ opacity: submitting ? 0.7 : 1 }}>
              {submitting ? 'Creating Task...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
