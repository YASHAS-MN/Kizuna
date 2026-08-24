import { useState, useEffect } from 'react'
import type { Project } from '../types/project.types'
import { teamService } from '../../teams/services/teamService'
import type { Team } from '../../teams/types/team.types'

interface ProjectOverviewProps {
  project: Project
}

export default function ProjectOverview({ project }: ProjectOverviewProps) {
  const [team, setTeam] = useState<Team | null>(null)
  const [loadingTeam, setLoadingTeam] = useState(true)
  const [teamError, setTeamError] = useState('')

  useEffect(() => {
    let isCurrent = true
    teamService
      .getTeam(project.teamId)
      .then((t) => {
        if (isCurrent) {
          if (!t) {
            setTeamError(`Associated team (ID: "${project.teamId}") could not be found.`)
          } else {
            setTeam(t)
          }
          setLoadingTeam(false)
        }
      })
      .catch((err) => {
        if (isCurrent) {
          console.error('Error fetching team for project overview:', err)
          setTeamError('Associated team information unavailable.')
          setLoadingTeam(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [project.teamId])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Description Card */}
      <div className="module-card" style={{ cursor: 'default' }}>
        <h3 className="module-title" style={{ fontSize: '1.15rem', marginBottom: '0.75rem' }}>
          Project Description
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6, margin: 0 }}>
          {project.description}
        </p>
      </div>

      {/* Grid: Team Roster & Metadata side-by-side */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Team Members Card */}
        <div className="module-card" style={{ cursor: 'default' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 className="module-title" style={{ fontSize: '1.1rem', margin: 0 }}>
              Team Members ({team ? team.name : 'Team'})
            </h3>
            {team && <span className="badge badge-info">{team.members.length} Members</span>}
          </div>

          {loadingTeam ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading team members...</p>
          ) : teamError ? (
            <div style={{ padding: '0.75rem 1rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '0.5rem', fontSize: '0.85rem' }}>
              {teamError}
            </div>
          ) : team ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
              {team.members.map((member) => (
                <div
                  key={member.userId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.625rem 0.875rem',
                    backgroundColor: 'var(--bg-tertiary)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '0.5rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                      {member.name}
                    </span>
                    <span className="badge badge-info" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                      {member.usn}
                    </span>
                  </div>
                  <span className={`badge ${member.role === 'TEAM_LEAD' ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.7rem' }}>
                    {member.role === 'TEAM_LEAD' ? 'Team Lead' : 'Member'}
                  </span>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Project Metadata Information Card */}
        <div className="module-card" style={{ cursor: 'default' }}>
          <h3 className="module-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
            Project Metadata
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Status</span>
              <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{project.status}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Created Date</span>
              <span style={{ color: 'var(--text-primary)' }}>{new Date(project.createdAt).toLocaleDateString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Assigned Team</span>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{team ? team.name : 'Unknown Team'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Assigned Mentor</span>
              <span style={{ color: 'var(--text-primary)' }}>{project.mentorInfo || 'Not assigned yet'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
