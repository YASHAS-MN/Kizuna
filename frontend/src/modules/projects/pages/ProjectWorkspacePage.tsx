import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Project } from '../types/project.types'
import { projectService } from '../services/projectService'
import { teamService } from '../../teams/services/teamService'
import ProjectOverview from '../components/ProjectOverview'

type TabType = 'overview' | 'tasks' | 'activity' | 'progress' | 'submissions'

export default function ProjectWorkspacePage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()

  const [project, setProject] = useState<Project | null>(null)
  const [teamName, setTeamName] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const [activeTab, setActiveTab] = useState<TabType>('overview')

  const loadProject = useCallback(async () => {
    if (!projectId) return
    try {
      const data = await projectService.getProject(projectId)
      if (!data) {
        setErrorMsg(`Project with ID "${projectId}" was not found.`)
      } else {
        setProject(data)
        // Resolve team name for workspace header
        try {
          const team = await teamService.getTeam(data.teamId)
          setTeamName(team ? team.name : 'Unassigned Team')
        } catch {
          setTeamName('Unassigned Team')
        }
      }
    } catch (err) {
      console.error('Failed to load project workspace:', err)
      setErrorMsg('Failed to load project workspace.')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadProject()
    const unsubscribe = projectService.subscribe(() => {
      loadProject()
    })
    return () => unsubscribe()
  }, [loadProject])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        Loading project workspace...
      </div>
    )
  }

  if (errorMsg || !project) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#ef4444', marginBottom: '0.5rem' }}>{errorMsg || 'Project not found'}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>The requested project workspace may have been removed or does not exist.</p>
        <button onClick={() => navigate('/projects')} className="btn btn-primary">
          Back to Project Workspaces
        </button>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="badge badge-success">ACTIVE</span>
      case 'PLANNING':
        return <span className="badge badge-info">PLANNING</span>
      case 'COMPLETED':
        return <span className="badge badge-warning">COMPLETED</span>
      default:
        return <span className="badge badge-info">{status}</span>
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Workspace Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
          borderRadius: '0.875rem',
          padding: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span className="hero-tagline" style={{ margin: 0, fontSize: '0.75rem' }}>
              Project Workspace
            </span>
            {getStatusBadge(project.status)}
          </div>
          <h1 className="hero-title" style={{ fontSize: '2.25rem', marginBottom: '0.5rem', textAlign: 'left' }}>
            {project.name}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Team: <strong style={{ color: 'var(--text-primary)' }}>{teamName}</strong> • Mentor: <strong style={{ color: 'var(--text-primary)' }}>{project.mentorInfo || 'Not assigned'}</strong>
          </p>
        </div>

        <button onClick={() => navigate('/projects')} className="btn btn-secondary">
          ← Back to Projects
        </button>
      </div>

      {/* Workspace Tab Bar */}
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--border-color)',
          paddingBottom: '0.5rem',
          overflowX: 'auto'
        }}
      >
        {(['overview', 'tasks', 'activity', 'progress', 'submissions'] as TabType[]).map((tab) => {
          const isActive = activeTab === tab
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: '0.625rem 1.25rem',
                backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
                color: isActive ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                textTransform: 'capitalize',
                transition: 'all 0.2s ease'
              }}
            >
              {tab}
            </button>
          )
        })}
      </div>

      {/* Tab Content Rendering */}
      <div>
        {activeTab === 'overview' && <ProjectOverview project={project} />}

        {activeTab === 'tasks' && (
          <div className="module-card" style={{ cursor: 'default', textAlign: 'center', padding: '3.5rem 2rem' }}>
            <div className="module-icon-wrapper" style={{ margin: '0 auto 1rem auto', width: '3rem', height: '3rem', fontSize: '1.5rem' }}>
              📋
            </div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Tasks & Kanban Board Placeholder
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto' }}>
              Task decomposition, assignment, and Kanban workflow management will be enabled in the upcoming task module.
            </p>
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="module-card" style={{ cursor: 'default', textAlign: 'center', padding: '3.5rem 2rem' }}>
            <div className="module-icon-wrapper" style={{ margin: '0 auto 1rem auto', width: '3rem', height: '3rem', fontSize: '1.5rem' }}>
              ⚡
            </div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Project Activity Feed Placeholder
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto' }}>
              Real-time project updates, GitHub commit feeds, and collaborator activity logs will be rendered here.
            </p>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="module-card" style={{ cursor: 'default', textAlign: 'center', padding: '3.5rem 2rem' }}>
            <div className="module-icon-wrapper" style={{ margin: '0 auto 1rem auto', width: '3rem', height: '3rem', fontSize: '1.5rem' }}>
              📊
            </div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Progress & Milestone Analytics Placeholder
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto' }}>
              Milestone completion velocity, chart metrics, and progress tracking will be enabled in a future slice.
            </p>
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="module-card" style={{ cursor: 'default', textAlign: 'center', padding: '3.5rem 2rem' }}>
            <div className="module-icon-wrapper" style={{ margin: '0 auto 1rem auto', width: '3rem', height: '3rem', fontSize: '1.5rem' }}>
              📤
            </div>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Submissions & Deliverables Placeholder
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '480px', margin: '0 auto' }}>
              Artifact uploads, code repository links, and faculty review submissions will be managed here.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
