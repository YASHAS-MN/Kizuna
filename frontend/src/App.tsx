import { useState } from 'react'

interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'in-progress' | 'in-review' | 'planning'
  team: string
}

interface Member {
  name: string
  role: string
}

interface Team {
  id: string
  name: string
  project: string
  members: Member[]
  skills: string[]
}

interface Mentor {
  id: string
  name: string
  title: string
  bio: string
  expertise: string[]
  initials: string
}

interface Submission {
  id: string
  milestone: string
  project: string
  submittedAt: string
  status: 'graded' | 'pending'
  score?: string
}

function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'teams' | 'mentors' | 'submissions'>('dashboard')
  const [searchQuery, setSearchQuery] = useState('')

  // Mock Data
  const mockProjects: Project[] = [
    {
      id: 'p1',
      name: 'Kizuna Platform Foundation',
      description: 'Initial scaffolding and structural styling for the student collaborative ecosystem.',
      status: 'active',
      team: 'Team Alpha',
    },
    {
      id: 'p2',
      name: 'AI-Powered Resume Analyzer',
      description: 'An AI-driven parsing assistant that checks resume alignment with tech job descriptions.',
      status: 'in-review',
      team: 'Team Beta',
    },
    {
      id: 'p3',
      name: 'Campus Event Coordination Hub',
      description: 'Web application helping university clubs plan, advertise, and run campus-wide activities.',
      status: 'planning',
      team: 'Team Gamma',
    },
    {
      id: 'p4',
      name: 'Smart Dorm Energy Monitor',
      description: 'IoT sensor network dashboard visualizing electricity and water usage in housing facilities.',
      status: 'in-progress',
      team: 'Team Delta',
    }
  ]

  const mockTeams: Team[] = [
    {
      id: 't1',
      name: 'Team Alpha',
      project: 'Kizuna Platform Foundation',
      members: [
        { name: 'Alice Watson', role: 'Lead Frontend Developer' },
        { name: 'Bob Jenkins', role: 'UI Designer' },
        { name: 'Charlie Kim', role: 'QA Tester' },
      ],
      skills: ['React', 'TypeScript', 'CSS Grid', 'Figma'],
    },
    {
      id: 't2',
      name: 'Team Beta',
      project: 'AI-Powered Resume Analyzer',
      members: [
        { name: 'David Smith', role: 'Machine Learning Lead' },
        { name: 'Elena Rostova', role: 'Full Stack Engineer' },
      ],
      skills: ['Python', 'FastAPI', 'React', 'OpenAI API'],
    },
    {
      id: 't3',
      name: 'Team Gamma',
      project: 'Campus Event Coordination Hub',
      members: [
        { name: 'Gavin O\'Connor', role: 'Project Manager' },
        { name: 'Hana Tanaka', role: 'Frontend Engineer' },
        { name: 'Ian Wright', role: 'Backend Engineer' },
      ],
      skills: ['Vue.js', 'Node.js', 'PostgreSQL', 'Tailwind'],
    }
  ]

  const mockMentors: Mentor[] = [
    {
      id: 'm1',
      name: 'Dr. Sarah Jenkins',
      title: 'Associate Professor, Computer Science',
      bio: 'Specializes in distributed systems, human-computer interaction, and cloud infrastructure architectures.',
      expertise: ['Cloud Architecture', 'React Architecture', 'System Scaling'],
      initials: 'SJ'
    },
    {
      id: 'm2',
      name: 'Marcus Chen',
      title: 'Senior UX Researcher at DesignLabs',
      bio: 'Industry mentor guiding students on design sprints, user testing methodologies, and prototyping.',
      expertise: ['UI/UX Design', 'User Research', 'Product Strategy'],
      initials: 'MC'
    },
    {
      id: 'm3',
      name: 'Prof. Alan Vance',
      title: 'Director of AI Research Initiative',
      bio: 'Guiding projects incorporating large language models, regression analysis, and neural networks.',
      expertise: ['Machine Learning', 'Python Backend', 'Vector Databases'],
      initials: 'AV'
    }
  ]

  const mockSubmissions: Submission[] = [
    {
      id: 's1',
      milestone: 'Milestone 1: Architecture Proposal',
      project: 'Kizuna Platform Foundation',
      submittedAt: '2026-08-15',
      status: 'graded',
      score: '95/100'
    },
    {
      id: 's2',
      milestone: 'Milestone 2: Design Prototype',
      project: 'AI-Powered Resume Analyzer',
      submittedAt: '2026-08-16',
      status: 'pending'
    },
    {
      id: 's3',
      milestone: 'Milestone 1: Architecture Proposal',
      project: 'Campus Event Coordination Hub',
      submittedAt: '2026-08-14',
      status: 'graded',
      score: '88/100'
    }
  ]

  const getStatusBadge = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return <span className="badge badge-success">Active</span>
      case 'in-progress':
        return <span className="badge badge-info">In Progress</span>
      case 'in-review':
        return <span className="badge badge-warning">In Review</span>
      case 'planning':
        return <span className="badge badge-muted">Planning</span>
      default:
        return <span className="badge badge-muted">{status}</span>
    }
  }

  const filteredProjects = mockProjects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.team.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="app-shell">
      {/* Navigation Header */}
      <header className="navbar">
        <div className="logo-container">
          <div className="logo-icon">絆</div>
          <span className="logo-text">Kizuna</span>
          <span className="nav-badge">v0.1</span>
        </div>
        <nav className="nav-links">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('projects')}
            className={`nav-item ${activeTab === 'projects' ? 'active' : ''}`}
          >
            Projects
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`nav-item ${activeTab === 'teams' ? 'active' : ''}`}
          >
            Teams
          </button>
          <button
            onClick={() => setActiveTab('mentors')}
            className={`nav-item ${activeTab === 'mentors' ? 'active' : ''}`}
          >
            Mentors
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`nav-item ${activeTab === 'submissions' ? 'active' : ''}`}
          >
            Submissions
          </button>
        </nav>
      </header>

      {/* Main Application Area */}
      <main className="main-content">
        
        {/* VIEW 1: DASHBOARD (LANDING) */}
        {activeTab === 'dashboard' && (
          <div>
            <section className="hero-section">
              <span className="hero-tagline">Frontend Foundation Built</span>
              <h1 className="hero-title">
                The collaborative bond for <span>student innovation</span>
              </h1>
              <p className="hero-description">
                Kizuna aligns student projects, peer-led team formations, mentor guidelines, 
                and grade rubrics into one unified environment. Click any section below to test the shell interfaces.
              </p>
              <div className="hero-actions">
                <button onClick={() => setActiveTab('projects')} className="btn btn-primary">
                  View Projects
                </button>
                <button onClick={() => setActiveTab('teams')} className="btn btn-secondary">
                  Browse Teams
                </button>
              </div>
            </section>

            <div className="modules-grid">
              <div className="module-card" onClick={() => setActiveTab('projects')}>
                <div className="module-icon-wrapper">📁</div>
                <h3 className="module-title">Student Projects</h3>
                <p className="module-text">Track milestone progressions, assign backlogs, and organize project deliverables.</p>
              </div>

              <div className="module-card" onClick={() => setActiveTab('teams')}>
                <div className="module-icon-wrapper">👥</div>
                <h3 className="module-title">Team Builder</h3>
                <p className="module-text">Connect student skill profiles, balance project groups, and manage internal roles.</p>
              </div>

              <div className="module-card" onClick={() => setActiveTab('mentors')}>
                <div className="module-icon-wrapper">🎓</div>
                <h3 className="module-title">Mentors & Staff</h3>
                <p className="module-text">Facilitate reviews, query guide directories, and allocate office hours.</p>
              </div>

              <div className="module-card" onClick={() => setActiveTab('submissions')}>
                <div className="module-icon-wrapper">📤</div>
                <h3 className="module-title">Evaluation Hub</h3>
                <p className="module-text">Submit project deliverables, consult marking rubrics, and view formal feedback.</p>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: PROJECTS */}
        {activeTab === 'projects' && (
          <div>
            <div className="page-header">
              <h1 className="page-title">Student Projects</h1>
              <p className="page-subtitle">Track, filter, and review active project workspaces.</p>
            </div>
            
            <div className="search-bar">
              <input
                type="text"
                placeholder="Search projects, descriptions, or teams..."
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="project-list">
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <div key={project.id} className="project-item">
                    <div className="project-info">
                      <h3 className="project-name">{project.name}</h3>
                      <p className="project-desc">{project.description}</p>
                      <div className="project-meta">
                        {getStatusBadge(project.status)}
                        <span className="project-team">Assigned to: <strong>{project.team}</strong></span>
                      </div>
                    </div>
                    <button className="btn btn-secondary">Workspace</button>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  No projects match your search criteria.
                </div>
              )}
            </div>
          </div>
        )}

        {/* VIEW 3: TEAMS */}
        {activeTab === 'teams' && (
          <div>
            <div className="page-header">
              <h1 className="page-title">Team Builder</h1>
              <p className="page-subtitle">Form collaborations, match skillset profiles, and scale resources.</p>
            </div>

            <div className="teams-grid">
              {mockTeams.map((team) => (
                <div key={team.id} className="team-card">
                  <div className="team-header">
                    <div>
                      <h3 className="team-title">{team.name}</h3>
                      <p className="team-project">{team.project}</p>
                    </div>
                  </div>

                  <div className="team-members">
                    {team.members.map((member, i) => (
                      <div key={i} className="member-row">
                        <div className="member-identity">
                          <div className="member-avatar">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="member-name">{member.name}</span>
                        </div>
                        <span className="member-role">{member.role}</span>
                      </div>
                    ))}
                  </div>

                  <div className="team-skills">
                    {team.skills.map((skill, i) => (
                      <span key={i} className="skill-tag">{skill}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 4: MENTORS */}
        {activeTab === 'mentors' && (
          <div>
            <div className="page-header">
              <h1 className="page-title">Mentor Directory</h1>
              <p className="page-subtitle">Reach out to faculty and industry leaders for reviews.</p>
            </div>

            <div className="mentors-grid">
              {mockMentors.map((mentor) => (
                <div key={mentor.id} className="mentor-card">
                  <div className="mentor-avatar-lg">{mentor.initials}</div>
                  <h3 className="mentor-name">{mentor.name}</h3>
                  <p className="mentor-title">{mentor.title}</p>
                  <p className="mentor-bio">{mentor.bio}</p>
                  <div className="mentor-expertise">
                    {mentor.expertise.map((tag, i) => (
                      <span key={i} className="skill-tag" style={{ borderColor: 'var(--accent-primary)', color: 'var(--accent-primary)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <button className="btn btn-secondary" style={{ width: '100%', marginTop: 'auto' }}>
                    Request Session
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* VIEW 5: EVALUATION / SUBMISSIONS */}
        {activeTab === 'submissions' && (
          <div>
            <div className="page-header">
              <h1 className="page-title">Evaluation Hub</h1>
              <p className="page-subtitle">Submit deliverables and review grading outcomes.</p>
            </div>

            <div className="submissions-table-container">
              <table className="submissions-table">
                <thead>
                  <tr>
                    <th>Deliverable</th>
                    <th>Project Group</th>
                    <th>Date Submitted</th>
                    <th>Status</th>
                    <th>Score</th>
                  </tr>
                </thead>
                <tbody>
                  {mockSubmissions.map((sub) => (
                    <tr key={sub.id}>
                      <td className="submission-project">{sub.milestone}</td>
                      <td>{sub.project}</td>
                      <td className="submission-meta">{sub.submittedAt}</td>
                      <td>
                        {sub.status === 'graded' ? (
                          <span className="badge badge-success">Graded</span>
                        ) : (
                          <span className="badge badge-warning">Pending Review</span>
                        )}
                      </td>
                      <td className="submission-score" style={{ color: sub.score ? 'var(--success)' : 'var(--text-muted)' }}>
                        {sub.score || '--'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p>&copy; {new Date().getFullYear()} Kizuna. All rights reserved.</p>
          <div className="footer-status">
            <span className="status-dot"></span>
            <span>Vite Dev Environment Running</span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
