import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { projectService } from '../../projects/services/projectService'
import { submissionService } from '../../submissions/services/submissionService'
import type { Submission } from '../../submissions/types/submission.types'
import type { Project } from '../../projects/types/project.types'

export default function MentorProjectSubmissionsPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [project, setProject] = useState<Project | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const loadData = useCallback(async () => {
    if (!projectId || !user) return
    try {
      setErrorMsg('')
      
      // Verify mentor assignment implicitly or explicitly
      const projectData = await projectService.getProject(projectId)
      if (!projectData) {
        setErrorMsg('Project not found.')
        return
      }

      // Check if project is assigned to this mentor
      if (projectData.mentorId !== user.id) {
        setErrorMsg('You are not assigned to review this project.')
        return
      }

      setProject(projectData)

      const submissionsData = await submissionService.getSubmissionsForProject(projectId)
      setSubmissions(submissionsData)
    } catch (err) {
      console.error('Failed to load project submissions for mentor:', err)
      setErrorMsg('Failed to load submissions.')
    } finally {
      setLoading(false)
    }
  }, [projectId, user])

  useEffect(() => {
    setLoading(true)
    loadData()

    const unsubProject = projectService.subscribe(() => loadData())
    const unsubSubmissions = submissionService.subscribe(() => loadData())

    return () => {
      unsubProject()
      unsubSubmissions()
    }
  }, [loadData])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        Loading submissions...
      </div>
    )
  }

  if (errorMsg || !project) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '3rem 1.5rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '0.875rem',
          border: '1px solid var(--border-color)'
        }}
      >
        <h2 style={{ fontSize: '1.25rem', color: '#ef4444', marginBottom: '0.5rem' }}>
          {errorMsg || 'Project not found'}
        </h2>
        <button onClick={() => navigate('/mentor')} className="btn btn-primary" style={{ marginTop: '1rem' }}>
          ← Back to Mentor Dashboard
        </button>
      </div>
    )
  }

  function getStatusBadge(status: Submission['status']) {
    switch (status) {
      case 'DRAFT':
        return <span className="badge badge-warning">Draft</span>
      case 'SUBMITTED':
        return <span className="badge badge-info">Submitted</span>
      case 'UNDER_REVIEW':
        return <span className="badge badge-warning">Under Review</span>
      case 'REVIEWED':
        return <span className="badge badge-success">Reviewed</span>
      default:
        return <span className="badge badge-muted">{status}</span>
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
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
          <span
            className="hero-tagline"
            style={{ margin: 0, fontSize: '0.75rem', display: 'inline-block', marginBottom: '0.5rem' }}
          >
            Mentor Portal — Submissions
          </span>
          <h1 className="hero-title" style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'left' }}>
            {project.name}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Review formal deliverables submitted by the team.
          </p>
        </div>

        <button onClick={() => navigate(`/mentor/teams/${project.teamId}`)} className="btn btn-secondary">
          ← Back to Team View
        </button>
      </div>

      {/* Submissions List */}
      <div>
        <h2
          style={{
            fontSize: '1rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            marginBottom: '1rem'
          }}
        >
          Project Submissions ({submissions.length})
        </h2>

        {submissions.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '2.5rem',
              backgroundColor: 'var(--bg-secondary)',
              borderRadius: '0.875rem',
              border: '1px solid var(--border-color)',
              color: 'var(--text-muted)'
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📤</div>
            <p style={{ fontWeight: 500 }}>No submissions found for this project.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {submissions.map((submission) => {
              const isDraft = submission.status === 'DRAFT'
              
              let actionLabel = 'View Details'
              if (submission.status === 'SUBMITTED') actionLabel = 'Start Review'
              else if (submission.status === 'UNDER_REVIEW') actionLabel = 'Continue Review'
              else if (submission.status === 'REVIEWED') actionLabel = 'View Review'

              return (
                <div
                  key={submission.id}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.75rem',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            backgroundColor: 'rgba(99, 102, 241, 0.15)',
                            color: 'var(--accent-primary)',
                            borderRadius: '0.375rem',
                            border: '1px solid rgba(99, 102, 241, 0.3)'
                          }}
                        >
                          v{submission.version}
                        </span>
                        {getStatusBadge(submission.status)}
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          By <strong style={{ color: 'var(--text-secondary)' }}>{submission.submittedByName}</strong>
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        {submission.title}
                      </h3>
                    </div>

                    {!isDraft ? (
                      <button
                        type="button"
                        onClick={() => navigate(`/mentor/submissions/${submission.id}/review`)}
                        className="btn btn-primary"
                        style={{ padding: '0.45rem 1rem', fontSize: '0.85rem' }}
                      >
                        {actionLabel}
                      </button>
                    ) : (
                      <div
                        style={{
                          fontSize: '0.8rem',
                          color: 'var(--text-muted)',
                          backgroundColor: 'var(--bg-tertiary)',
                          padding: '0.35rem 0.75rem',
                          borderRadius: '0.375rem',
                          border: '1px solid var(--border-color)'
                        }}
                      >
                        Drafts cannot be reviewed
                      </div>
                    )}
                  </div>
                  
                  <div
                    style={{
                      display: 'flex',
                      gap: '1rem',
                      flexWrap: 'wrap',
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      borderTop: '1px solid var(--border-color)',
                      paddingTop: '0.75rem'
                    }}
                  >
                    <span>Created: {new Date(submission.createdAt).toLocaleDateString()}</span>
                    {submission.submittedAt && (
                      <span style={{ color: 'var(--info)' }}>
                        Submitted: {new Date(submission.submittedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
