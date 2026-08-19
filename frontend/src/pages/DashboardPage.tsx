import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchApiHealth } from '../services/api/health'

type ApiStatus = 'checking' | 'connected' | 'unavailable'

export default function DashboardPage() {
  const navigate = useNavigate()
  const [apiStatus, setApiStatus] = useState<ApiStatus>('checking')

  useEffect(() => {
    let isMounted = true

    fetchApiHealth()
      .then((data) => {
        if (isMounted) {
          if (data && data.status === 'ok') {
            setApiStatus('connected')
          } else {
            setApiStatus('unavailable')
          }
        }
      })
      .catch(() => {
        if (isMounted) {
          setApiStatus('unavailable')
        }
      })

    return () => {
      isMounted = false
    }
  }, [])

  const renderApiStatusBadge = () => {
    switch (apiStatus) {
      case 'checking':
        return (
          <span className="badge badge-muted" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <strong>Kizuna API:</strong> Checking...
          </span>
        )
      case 'connected':
        return (
          <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
            <strong>Kizuna API:</strong> ✓ Connected
          </span>
        )
      case 'unavailable':
        return (
          <span
            className="badge"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              border: '1px solid rgba(239, 68, 68, 0.3)',
            }}
          >
            <strong>Kizuna API:</strong> ✗ Unavailable
          </span>
        )
    }
  }

  return (
    <div>
      <section className="hero-section">
        <div style={{ marginBottom: '1.25rem', display: 'flex', justifyContent: 'center', gap: '0.75rem', alignItems: 'center' }}>
          <span className="hero-tagline" style={{ margin: 0 }}>
            End-to-End Integration
          </span>
          {renderApiStatusBadge()}
        </div>

        <h1 className="hero-title">
          The collaborative bond for <span>student innovation</span>
        </h1>
        <p className="hero-description">
          Kizuna aligns student projects, peer-led team formations, mentor guidelines, 
          and grade rubrics into one unified environment. Browse active modules to explore.
        </p>
        <div className="hero-actions">
          <button onClick={() => navigate('/projects')} className="btn btn-primary">
            View Projects
          </button>
          <button onClick={() => navigate('/teams')} className="btn btn-secondary">
            Browse Teams
          </button>
        </div>
      </section>

      <div className="modules-grid">
        <div className="module-card" onClick={() => navigate('/projects')}>
          <div className="module-icon-wrapper">📁</div>
          <h3 className="module-title">Student Projects</h3>
          <p className="module-text">Track milestone progressions, assign backlogs, and organize project deliverables.</p>
        </div>

        <div className="module-card" onClick={() => navigate('/teams')}>
          <div className="module-icon-wrapper">👥</div>
          <h3 className="module-title">Team Builder</h3>
          <p className="module-text">Connect student skill profiles, balance project groups, and manage internal roles.</p>
        </div>

        <div className="module-card" onClick={() => navigate('/mentors')}>
          <div className="module-icon-wrapper">🎓</div>
          <h3 className="module-title">Mentors & Staff</h3>
          <p className="module-text">Facilitate reviews, query guide directories, and allocate office hours.</p>
        </div>

        <div className="module-card" onClick={() => navigate('/submissions')}>
          <div className="module-icon-wrapper">📤</div>
          <h3 className="module-title">Evaluation Hub</h3>
          <p className="module-text">Submit project deliverables, consult marking rubrics, and view formal feedback.</p>
        </div>
      </div>
    </div>
  )
}
