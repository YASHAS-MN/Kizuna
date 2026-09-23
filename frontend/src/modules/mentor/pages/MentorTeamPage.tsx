import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { teamService } from '../../teams/services/teamService'
import { projectService } from '../../projects/services/projectService'
import { progressService } from '../../progress/services/progressService'
import type { Team } from '../../teams/types/team.types'
import type { MentorProjectView } from '../types/mentor.types'

/**
 * Read-only mentor view of a single team at /mentor/teams/:teamId.
 *
 * Displays:
 *   - Team name, creation date
 *   - Member list (name, USN, role) — read-only, no add/remove/edit controls
 *   - Projects for this team with status badges and progress bars
 *
 * All progress data is derived through progressService.
 * No mutation controls of any kind are exposed.
 */
export default function MentorTeamPage() {
  const { teamId } = useParams<{ teamId: string }>()
  const navigate = useNavigate()

  const [team, setTeam] = useState<Team | null>(null)
  const [projectViews, setProjectViews] = useState<MentorProjectView[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const loadTeamData = useCallback(async () => {
    if (!teamId) return
    try {
      setErrorMsg('')

      const [teamData, projects] = await Promise.all([
        teamService.getTeam(teamId),
        projectService.getProjectsForTeam(teamId)
      ])

      if (!teamData) {
        setErrorMsg(`Team with ID "${teamId}" was not found.`)
        return
      }

      setTeam(teamData)

      // Derive progress for each project
      const views: MentorProjectView[] = await Promise.all(
        projects.map(async (project) => {
          const progress = await progressService.getProjectProgress(project.id)
          return {
            project,
            teamName: teamData.name,
            progress
          }
        })
      )

      setProjectViews(views)
    } catch (err) {
      console.error('Failed to load mentor team view:', err)
      setErrorMsg('Failed to load team details.')
    } finally {
      setLoading(false)
    }
  }, [teamId])

  useEffect(() => {
    setLoading(true)
    loadTeamData()

    // Subscribe to all relevant domain service changes for reactivity
    const unsubTeam = teamService.subscribe(() => loadTeamData())
    const unsubProject = projectService.subscribe(() => loadTeamData())
    const unsubProgress = progressService.subscribe(() => loadTeamData())

    return () => {
      unsubTeam()
      unsubProject()
      unsubProgress()
    }
  }, [loadTeamData])

  // --- Loading State ---
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        Loading team details...
      </div>
    )
  }

  // --- Error State ---
  if (errorMsg || !team) {
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
          {errorMsg || 'Team not found'}
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          The requested team may not be assigned to you or does not exist.
        </p>
        <button onClick={() => navigate('/mentor')} className="btn btn-primary">
          ← Back to Mentor Dashboard
        </button>
      </div>
    )
  }

  const teamLead = team.members.find((m) => m.role === 'TEAM_LEAD')

  function getStatusBadge(status: string) {
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

  function getRoleLabel(role: string) {
    return role === 'TEAM_LEAD' ? 'Team Lead' : 'Member'
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
            Mentor Portal — Team View
          </span>
          <h1 className="hero-title" style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'left' }}>
            {team.name}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Lead:{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {teamLead?.name ?? 'Unassigned'}
            </strong>{' '}
            • Created {new Date(team.createdAt).toLocaleDateString()}
          </p>
        </div>

        <button onClick={() => navigate('/mentor')} className="btn btn-secondary">
          ← Back to Dashboard
        </button>
      </div>

      {/* Members Section — Read-Only */}
      <section>
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
          Team Members ({team.members.length})
        </h2>

        <div
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)',
            borderRadius: '0.875rem',
            overflow: 'hidden'
          }}
        >
          {team.members.length === 0 ? (
            <p style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              No members found.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {team.members.map((member, idx) => (
                <div
                  key={member.userId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1rem 1.5rem',
                    borderBottom:
                      idx < team.members.length - 1 ? '1px solid var(--border-color)' : 'none'
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: '2.25rem',
                      height: '2.25rem',
                      borderRadius: '9999px',
                      background: 'var(--accent-gradient)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      color: 'white',
                      flexShrink: 0
                    }}
                  >
                    {member.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        color: 'var(--text-primary)',
                        fontSize: '0.9rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {member.name}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.1rem' }}>
                      {member.usn}
                    </div>
                  </div>

                  <span
                    className={member.role === 'TEAM_LEAD' ? 'badge badge-info' : 'badge badge-muted'}
                    style={{ flexShrink: 0 }}
                  >
                    {getRoleLabel(member.role)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Projects Section — Read-Only with Progress */}
      <section>
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
          Team Projects ({projectViews.length})
        </h2>

        {projectViews.length === 0 ? (
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
            <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📁</div>
            <p style={{ fontWeight: 500 }}>No projects assigned to this team yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {projectViews.map(({ project, progress }) => {
              const pct = progress.overall.completionPercentage
              const barColor = pct >= 75 ? '#10b981' : pct >= 40 ? '#6366f1' : '#f59e0b'

              return (
                <div
                  key={project.id}
                  style={{
                    backgroundColor: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.875rem',
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem'
                  }}
                >
                  {/* Project Name & Status */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <div>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                        {project.name}
                      </h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        {project.description}
                      </p>
                    </div>
                    {getStatusBadge(project.status)}
                  </div>

                  {/* Progress Bar — derived from progressService */}
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '0.4rem'
                      }}
                    >
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                        Task Progress
                      </span>
                      <span
                        style={{
                          fontSize: '0.875rem',
                          fontWeight: 700,
                          color: barColor,
                          fontFamily: 'var(--font-display)'
                        }}
                      >
                        {pct}%
                      </span>
                    </div>
                    <div
                      style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: 'var(--bg-tertiary)',
                        borderRadius: '9999px',
                        overflow: 'hidden'
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          backgroundColor: barColor,
                          borderRadius: '9999px',
                          transition: 'width 0.4s ease'
                        }}
                      />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
                      {progress.overall.completedTasks} of {progress.overall.totalTasks} tasks completed
                      {' • '}
                      {progress.overall.inProgressTasks} in progress
                      {' • '}
                      {progress.overall.todoTasks} pending
                    </p>
                  </div>
                  
                  <div style={{ marginTop: '0.5rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                    <button
                      onClick={() => navigate(`/mentor/projects/${project.id}/submissions`)}
                      className="btn btn-secondary"
                      style={{ width: '100%', fontSize: '0.85rem' }}
                    >
                      View Submissions →
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
