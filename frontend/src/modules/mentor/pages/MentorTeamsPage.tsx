import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { mentorService } from '../services/mentorService'
import type { MentorTeamView } from '../types/mentor.types'
import MentorTeamCard from '../components/MentorTeamCard'

/**
 * Lists all teams assigned to the authenticated mentor.
 * Each team card links to /mentor/teams/:teamId.
 */
export default function MentorTeamsPage() {
  const { user } = useAuth()
  const [teamViews, setTeamViews] = useState<MentorTeamView[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const loadTeams = useCallback(async () => {
    if (!user) return
    try {
      setErrorMsg('')
      const data = await mentorService.getMentorTeams(user.id)
      setTeamViews(data)
    } catch (err) {
      console.error('Failed to load mentor teams:', err)
      setErrorMsg('Failed to load assigned teams.')
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    setLoading(true)
    loadTeams()

    const unsubscribe = mentorService.subscribe(() => {
      loadTeams()
    })

    return () => unsubscribe()
  }, [loadTeams])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        Loading assigned teams...
      </div>
    )
  }

  if (errorMsg) {
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
        <h2 style={{ fontSize: '1.25rem', color: '#ef4444', marginBottom: '0.5rem' }}>{errorMsg}</h2>
        <button onClick={() => { setLoading(true); loadTeams() }} className="btn btn-secondary">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Page Header */}
      <div>
        <span
          className="hero-tagline"
          style={{ margin: 0, fontSize: '0.75rem', display: 'inline-block', marginBottom: '0.5rem' }}
        >
          Mentor Portal
        </span>
        <h1 className="hero-title" style={{ fontSize: '1.75rem', marginBottom: '0.25rem', textAlign: 'left' }}>
          Assigned Teams
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Teams currently assigned to you for mentorship oversight.
        </p>
      </div>

      {/* Teams Grid */}
      {teamViews.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '3rem',
            backgroundColor: 'var(--bg-secondary)',
            borderRadius: '0.875rem',
            border: '1px solid var(--border-color)',
            color: 'var(--text-muted)'
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👥</div>
          <p style={{ fontWeight: 500 }}>No teams assigned yet.</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Teams assigned to your mentorship will appear here.
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem'
          }}
        >
          {teamViews.map((teamView) => (
            <MentorTeamCard key={teamView.team.id} teamView={teamView} />
          ))}
        </div>
      )}
    </div>
  )
}
