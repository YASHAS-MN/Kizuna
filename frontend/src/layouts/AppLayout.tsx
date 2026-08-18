import { NavLink, Outlet } from 'react-router-dom'

export default function AppLayout() {
  return (
    <div className="app-shell">
      {/* Navigation Header */}
      <header className="navbar">
        <div className="logo-container">
          <div className="logo-icon">絆</div>
          <span className="logo-text">Kizuna</span>
          <span className="nav-badge">v0.2</span>
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
