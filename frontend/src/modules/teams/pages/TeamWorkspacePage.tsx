import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { Team } from '../types/team.types'
import { teamService } from '../services/teamService'
import TeamMemberList from '../components/TeamMemberList'

export default function TeamWorkspacePage() {
  const { teamId } = useParams<{ teamId: string }>()
  const navigate = useNavigate()

  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const loadTeam = useCallback(async () => {
    if (!teamId) return
    try {
      const data = await teamService.getTeam(teamId)
      if (!data) {
        setErrorMsg(`Team with ID "${teamId}" was not found.`)
      } else {
        setTeam(data)
      }
    } catch (err) {
      console.error('Failed to load team workspace:', err)
      setErrorMsg('Failed to load team workspace.')
    } finally {
      setLoading(false)
    }
  }, [teamId])

  useEffect(() => {
    loadTeam()
    const unsubscribe = teamService.subscribe(() => {
      loadTeam()
    })
    return () => unsubscribe()
  }, [loadTeam])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        Loading team workspace...
      </div>
    )
  }

  if (errorMsg || !team) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem 1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#ef4444', marginBottom: '0.5rem' }}>{errorMsg || 'Team not found'}</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>The requested team workspace may have been removed or does not exist.</p>
        <button onClick={() => navigate('/teams')} className="btn btn-primary">
          Back to My Teams
        </button>
      </div>
    )
  }

  const teamLead = team.members.find((m) => m.role === 'TEAM_LEAD') || team.members[0]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
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
              Team Workspace
            </span>
            <span className="badge badge-success">Active Workspace</span>
          </div>
          <h1 className="hero-title" style={{ fontSize: '2.25rem', marginBottom: '0.5rem', textAlign: 'left' }}>
            {team.name}
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Team Lead: <strong style={{ color: 'var(--text-primary)' }}>{teamLead?.name || 'Unassigned'}</strong> • Created {new Date(team.createdAt).toLocaleDateString()}
          </p>
        </div>

        <button onClick={() => navigate('/teams')} className="btn btn-secondary">
          ← Back to Teams
        </button>
      </div>

      {/* Roster & Members List */}
      <TeamMemberList
        teamId={team.id}
        members={team.members}
        onRosterUpdated={loadTeam}
      />

      {/* Future Module Placeholders Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {/* Project Placeholder */}
        <div className="module-card" style={{ cursor: 'default' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div className="module-icon-wrapper" style={{ width: '2rem', height: '2rem', fontSize: '1rem', margin: 0 }}>
              📁
            </div>
            <h3 className="module-title" style={{ fontSize: '1.1rem', margin: 0 }}>
              Assigned Project
            </h3>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '0.5rem', border: '1px border-color' }}>
            <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>Placeholder</span>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              {team.projectPlaceholder || 'Not assigned yet'}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Project assignment and milestone tracking will be enabled in a future slice.
            </p>
          </div>
        </div>

        {/* Mentor Placeholder */}
        <div className="module-card" style={{ cursor: 'default' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <div className="module-icon-wrapper" style={{ width: '2rem', height: '2rem', fontSize: '1rem', margin: 0 }}>
              👨‍🏫
            </div>
            <h3 className="module-title" style={{ fontSize: '1.1rem', margin: 0 }}>
              Assigned Mentor / Staff
            </h3>
          </div>
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '0.5rem', border: '1px border-color' }}>
            <span className="badge badge-info" style={{ marginBottom: '0.5rem' }}>Placeholder</span>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 600 }}>
              {team.mentorPlaceholder || 'Not assigned yet'}
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Faculty mentor assignment and reviews will be enabled in a future slice.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
