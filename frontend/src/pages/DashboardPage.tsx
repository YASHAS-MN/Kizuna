import { useNavigate } from 'react-router-dom'

export default function DashboardPage() {
  const navigate = useNavigate()

  return (
    <div>
      <section className="hero-section">
        <span className="hero-tagline">Frontend Architecture Configured</span>
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
