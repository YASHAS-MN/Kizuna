import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Project } from '../types/project.types'
import { teamService } from '../../teams/services/teamService'

interface ProjectCardProps {
  project: Project
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate()
  const [teamName, setTeamName] = useState<string>('Loading team...')

  useEffect(() => {
    let isCurrent = true
    teamService
      .getTeam(project.teamId)
      .then((team) => {
        if (isCurrent) {
          setTeamName(team ? team.name : 'Unknown Team')
        }
      })
      .catch(() => {
        if (isCurrent) setTeamName('Unknown Team')
      })

    return () => {
      isCurrent = false
    }
  }, [project.teamId])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="badge badge-success">ACTIVE</span>
      case 'PLANNING':
        return <span className="badge badge-info">PLANNING</span>
      case 'COMPLETED':
        return <span className="badge badge-warning">COMPLETED</span>
      case 'ARCHIVED':
        return <span className="badge" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>ARCHIVED</span>
      default:
        return <span className="badge badge-info">{status}</span>
    }
  }

  return (
    <div
      className="module-card"
      onClick={() => navigate(`/projects/${project.id}`)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '1.5rem',
        cursor: 'pointer'
      }}
    >
      <div>
        {/* Header: Title + Status Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem', gap: '0.5rem' }}>
          <h3 className="module-title" style={{ fontSize: '1.2rem', margin: 0 }}>
            {project.name}
          </h3>
          {getStatusBadge(project.status)}
        </div>

        {/* Team Tag */}
        <p style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '0.75rem' }}>
          Team: {teamName}
        </p>

        {/* Description Preview */}
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.4,
            marginBottom: '1rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}
        >
          {project.description}
        </p>
      </div>

      {/* Footer Info */}
      <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <div>
          <span>Mentor: </span>
          <strong style={{ color: 'var(--text-secondary)' }}>{project.mentorInfo || 'Not assigned'}</strong>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            navigate(`/projects/${project.id}`)
          }}
          className="btn btn-secondary"
          style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
        >
          Open Workspace
        </button>
      </div>
    </div>
  )
}
