import { useNavigate } from 'react-router-dom'
import type { Team } from '../types/team.types'

interface TeamCardProps {
  team: Team
}

export default function TeamCard({ team }: TeamCardProps) {
  const navigate = useNavigate()
  const teamLead = team.members.find((m) => m.role === 'TEAM_LEAD') || team.members[0]

  return (
    <div
      className="module-card"
      onClick={() => navigate(`/teams/${team.id}`)}
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
        {/* Header: Name & Member Count Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <h3 className="module-title" style={{ fontSize: '1.25rem', margin: 0 }}>
            {team.name}
          </h3>
          <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
            {team.members.length} {team.members.length === 1 ? 'Member' : 'Members'}
          </span>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '0.75rem' }}>
          Team Lead: {teamLead ? teamLead.name : 'Unassigned'}
        </p>

        {/* Member Preview Avatars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            Roster Preview
          </span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {team.members.map((member) => (
              <span key={member.userId} className="skill-tag" style={{ fontSize: '0.8rem' }}>
                {member.name} ({member.role === 'TEAM_LEAD' ? 'Lead' : 'Member'})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Placeholders Footer */}
      <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
        <div>
          <strong>Project:</strong> <span style={{ color: 'var(--text-muted)' }}>{team.projectPlaceholder || 'Not assigned'}</span>
        </div>
        <div>
          <strong>Mentor:</strong> <span style={{ color: 'var(--text-muted)' }}>{team.mentorPlaceholder || 'Not assigned'}</span>
        </div>
      </div>
    </div>
  )
}
