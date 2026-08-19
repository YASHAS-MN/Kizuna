import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Team } from '../types/team.types'
import { teamService } from '../services/teamService'
import { useAuth } from '../../../context/AuthContext'
import TeamCard from '../components/TeamCard'

export default function TeamsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [teams, setTeams] = useState<Team[]>([])
  const [loading, setLoading] = useState(true)

  const loadTeams = useCallback(async () => {
    const currentUserId = user?.id || 'u1'
    try {
      const data = await teamService.getTeamsForUser(currentUserId)
      setTeams(data)
    } catch (err) {
      console.error('Failed to load teams:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadTeams()
    const unsubscribe = teamService.subscribe(() => {
      loadTeams()
    })
    return () => unsubscribe()
  }, [loadTeams])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header with Create Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">My Project Teams</h1>
          <p className="page-subtitle">Form, manage, and collaborate within academic project teams.</p>
        </div>
        <button onClick={() => navigate('/teams/create')} className="btn btn-primary">
          + Create New Team
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading your team rosters...
        </div>
      )}

      {!loading && (
        <div>
          {teams.length > 0 ? (
            <div className="modules-grid" style={{ marginTop: 0 }}>
              {teams.map((team) => (
                <TeamCard key={team.id} team={team} />
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: 'center',
                padding: '4rem 2rem',
                backgroundColor: 'var(--bg-secondary)',
                border: '1px solid var(--border-color)',
                borderRadius: '0.75rem'
              }}
            >
              <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                No project teams joined yet
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
                You have not created or joined any teams yet. Connect with classmates in Student Discovery or start a new team workspace.
              </p>
              <button onClick={() => navigate('/teams/create')} className="btn btn-primary">
                Form a New Team
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
