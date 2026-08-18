import { useState } from 'react'

interface Project {
  id: string
  name: string
  description: string
  status: 'active' | 'in-progress' | 'in-review' | 'planning'
  team: string
}

export default function ProjectsPage() {
  const [searchQuery, setSearchQuery] = useState('')

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
  )
}
