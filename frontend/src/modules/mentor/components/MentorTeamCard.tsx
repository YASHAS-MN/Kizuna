import { useNavigate } from 'react-router-dom'
import type { MentorTeamView } from '../types/mentor.types'

interface MentorTeamCardProps {
  teamView: MentorTeamView
}

/**
 * Read-only team card for the Mentor Dashboard.
 * Displays team name, member count, project count, and links to the
 * mentor-specific team detail page at /mentor/teams/:teamId.
 */
export default function MentorTeamCard({ teamView }: MentorTeamCardProps) {
  const navigate = useNavigate()
  const { team, projectCount } = teamView
  const memberCount = team.members.length
  const teamLead = team.members.find((m) => m.role === 'TEAM_LEAD')

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '0.875rem',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        transition: 'border-color 0.2s ease, transform 0.2s ease'
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'var(--accent-primary)'
        el.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLDivElement
        el.style.borderColor = 'var(--border-color)'
        el.style.transform = 'translateY(0)'
      }}
    >
      {/* Card Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
        <div
          style={{
            width: '2.5rem',
            height: '2.5rem',
            borderRadius: '0.5rem',
            background: 'var(--accent-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.1rem',
            flexShrink: 0
          }}
        >
          👥
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {team.name}
          </h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Lead: {teamLead?.name ?? 'Unassigned'}
          </p>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div
          style={{
            flex: 1,
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)'
            }}
          >
            {memberCount}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Members
          </div>
        </div>
        <div
          style={{
            flex: 1,
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '0.5rem',
            padding: '0.75rem',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              fontSize: '1.25rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-display)'
            }}
          >
            {projectCount}
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
            Projects
          </div>
        </div>
      </div>

      {/* Action */}
      <button
        id={`mentor-team-view-${team.id}`}
        onClick={() => navigate(`/mentor/teams/${team.id}`)}
        className="btn btn-secondary"
        style={{ width: '100%', padding: '0.6rem', fontSize: '0.875rem' }}
      >
        View Team →
      </button>
    </div>
  )
}
