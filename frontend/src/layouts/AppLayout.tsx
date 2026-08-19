import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (err) {
      console.error('Failed to log out:', err)
    }
  }

  return (
    <div className="app-shell">
      {/* Navigation Header */}
      <header className="navbar">
        <div className="logo-container">
          <div className="logo-icon">絆</div>
          <span className="logo-text">Kizuna</span>
          <span className="nav-badge">v0.3</span>
        </div>
        <nav className="nav-links">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/projects"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            Projects
          </NavLink>
          <NavLink
            to="/teams"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            Teams
          </NavLink>
          <NavLink
            to="/mentors"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            Mentors
          </NavLink>
          <NavLink
            to="/submissions"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            Submissions
          </NavLink>
        </nav>
        
        {/* User Identity & Logout Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderRight: '1px solid var(--border-color)', paddingRight: '1rem' }}>
              <div style={{ width: '2rem', height: '2rem', borderRadius: '9999px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, color: 'white' }}>
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.025em' }}>{user.role}</span>
              </div>
            </div>
          )}
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
            Logout
          </button>
        </div>
      </header>

      {/* Main Application Area (Render Router Viewports) */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} Kizuna. All rights reserved.</p>
          <div className="footer-status">
            <span className="status-dot"></span>
            <span>Vite + React Router Active</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
