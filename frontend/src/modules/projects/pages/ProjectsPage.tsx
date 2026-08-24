import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Project } from '../types/project.types'
import { projectService } from '../services/projectService'
import { useAuth } from '../../../context/AuthContext'
import ProjectCard from '../components/ProjectCard'

export default function ProjectsPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  const loadProjects = useCallback(async () => {
    const activeUserId = user?.id || 'u1'
    try {
      const data = await projectService.getProjectsForUser(activeUserId)
      setProjects(data)
    } catch (err) {
      console.error('Failed to load projects:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadProjects()
    const unsubscribe = projectService.subscribe(() => {
      loadProjects()
    })
    return () => unsubscribe()
  }, [loadProjects])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Project Workspaces</h1>
          <p className="page-subtitle">Track, collaborate, and manage academic projects for your teams.</p>
        </div>
        <button onClick={() => navigate('/projects/create')} className="btn btn-primary">
          + Create Project
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          Loading your team projects...
        </div>
      )}

      {!loading && (
        <div>
          {projects.length > 0 ? (
            <div className="modules-grid" style={{ marginTop: 0 }}>
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
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
                No active projects found
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '500px', margin: '0 auto 1.5rem auto' }}>
                Your teams do not have any projects initiated yet. Form a project for your team to begin collaboration.
              </p>
              <button onClick={() => navigate('/projects/create')} className="btn btn-primary">
                Create First Project
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
