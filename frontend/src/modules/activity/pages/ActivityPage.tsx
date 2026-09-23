import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { projectService } from '../../projects/services/projectService'
import ActivityTimeline from '../components/ActivityTimeline'

interface ActivityPageProps {
  projectId?: string
}

export default function ActivityPage({ projectId: projectIdProp }: ActivityPageProps) {
  const { projectId: routeProjectId } = useParams<{ projectId: string }>()
  const projectId = projectIdProp || routeProjectId
  const skipProjectCheck = Boolean(projectIdProp)
  const [projectError, setProjectError] = useState('')
  const [checkingProject, setCheckingProject] = useState(!skipProjectCheck)

  useEffect(() => {
    if (skipProjectCheck) {
      setProjectError('')
      setCheckingProject(false)
      return
    }
    let cancelled = false
    async function verifyProject() {
      if (!projectId) {
        setProjectError('A project ID is required to view activity.')
        setCheckingProject(false)
        return
      }
      try {
        const project = await projectService.getProject(projectId)
        if (!cancelled) {
          setProjectError(project ? '' : `Project with ID "${projectId}" was not found.`)
        }
      } catch {
        if (!cancelled) {
          setProjectError('Failed to verify the project for this activity feed.')
        }
      } finally {
        if (!cancelled) setCheckingProject(false)
      }
    }
    setCheckingProject(true)
    verifyProject()
    return () => {
      cancelled = true
    }
  }, [projectId, skipProjectCheck])

  if (checkingProject) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        Loading project activity...
      </div>
    )
  }

  if (projectError || !projectId) {
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
          {projectError || 'Invalid project'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
          Activity is scoped to a valid project workspace.
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h2 className="page-title" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
          Project Activity
        </h2>
        <p className="page-subtitle" style={{ margin: 0 }}>
          Chronological record of task, team, and comment events for this project.
        </p>
      </div>
      <ActivityTimeline projectId={projectId} />
    </div>
  )
}
