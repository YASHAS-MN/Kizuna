import { useState } from 'react'
import type { TeamMember, TeamRole } from '../types/team.types'
import { teamService } from '../services/teamService'

interface TeamMemberListProps {
  teamId: string
  members: TeamMember[]
  onRosterUpdated: () => void
}

export default function TeamMemberList({ teamId, members, onRosterUpdated }: TeamMemberListProps) {
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const handleRoleChange = async (userId: string, currentRole: TeamRole) => {
    const newRole: TeamRole = currentRole === 'TEAM_LEAD' ? 'MEMBER' : 'TEAM_LEAD'
    setUpdatingUserId(userId)
    setErrorMsg('')
    try {
      await teamService.updateMemberRole(teamId, userId, newRole)
      onRosterUpdated()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update member role.')
    } finally {
      setUpdatingUserId(null)
    }
  }

  return (
    <div className="module-card" style={{ cursor: 'default' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 className="module-title" style={{ fontSize: '1.2rem', margin: 0 }}>
          Team Members & Roles
        </h3>
        <span className="badge badge-info">{members.length} Total</span>
      </div>

      {errorMsg && (
        <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', padding: '0.5rem 0.75rem', borderRadius: '0.375rem', fontSize: '0.85rem', marginBottom: '1rem' }}>
          {errorMsg}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {members.map((member) => (
          <div
            key={member.userId}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.875rem 1rem',
              backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '0.5rem'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                  {member.name}
                </span>
                <span className="badge badge-info" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
                  {member.usn}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className={`badge ${member.role === 'TEAM_LEAD' ? 'badge-warning' : 'badge-success'}`} style={{ fontSize: '0.75rem' }}>
                {member.role === 'TEAM_LEAD' ? 'Team Lead' : 'Member'}
              </span>

              <button
                onClick={() => handleRoleChange(member.userId, member.role)}
                disabled={updatingUserId === member.userId}
                className="btn btn-secondary"
                style={{ padding: '0.25rem 0.6rem', fontSize: '0.75rem' }}
              >
                {updatingUserId === member.userId ? 'Updating...' : `Set as ${member.role === 'TEAM_LEAD' ? 'Member' : 'Lead'}`}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
