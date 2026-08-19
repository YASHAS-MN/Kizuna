import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import StudentSearch from '../modules/users/components/StudentSearch'
import InvitationInbox from '../modules/invitations/components/InvitationInbox'

export default function HomePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [pendingCount, setPendingCount] = useState(0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Workspace Welcome & Command Header */}
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
              Command Center
            </span>
            <span className="badge badge-success">Workspace Active</span>
          </div>
          <h1 className="hero-title" style={{ fontSize: '2.25rem', marginBottom: '0.5rem', textAlign: 'left' }}>
            Welcome back, <span>{user?.name || 'Student'}</span>!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem', maxWidth: '600px' }}>
            Your central hub for student discovery, team assembly, mentor reviews, and project submissions.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button onClick={() => navigate('/projects')} className="btn btn-primary">
            Workspace Projects
          </button>
          <button onClick={() => navigate('/teams')} className="btn btn-secondary">
            Team Roster
          </button>
        </div>
      </div>

      {/* Grid Section: Team Invitation Inbox / Recent Activity Side-by-Side */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {/* Team Invitations Inbox Component */}
        <div className="module-card" style={{ cursor: 'default' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="module-icon-wrapper" style={{ width: '2rem', height: '2rem', fontSize: '1rem', margin: 0 }}>
                📩
              </div>
              <h3 className="module-title" style={{ fontSize: '1.1rem', margin: 0 }}>
                Team Invitations Inbox
              </h3>
            </div>
            <span className="badge badge-info">{pendingCount} Pending</span>
          </div>

          {/* Render Invitation Inbox Component */}
          <InvitationInbox onCountChange={(count) => setPendingCount(count)} />
        </div>

        {/* Recent Activity Timeline Placeholder */}
        <div className="module-card" style={{ cursor: 'default' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <div className="module-icon-wrapper" style={{ width: '2rem', height: '2rem', fontSize: '1rem', margin: 0 }}>
              ⚡
            </div>
            <h3 className="module-title" style={{ fontSize: '1.1rem', margin: 0 }}>
              Recent Project Activity
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Alice Rao uploaded architecture diagram</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>2h ago</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Team Beta formed for Resume Analyzer</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>5h ago</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Grading rubric published for Milestone 1</span>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>1d ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Student Discovery Module */}
      <div>
        <div className="page-header" style={{ marginBottom: '1.25rem' }}>
          <h2 className="page-title" style={{ fontSize: '1.75rem' }}>Student Discovery & Matchmaking</h2>
          <p className="page-subtitle">Find peers by Name or USN to form multi-disciplinary project teams.</p>
        </div>

        {/* Student Search Component */}
        <StudentSearch />
      </div>
    </div>
  )
}
