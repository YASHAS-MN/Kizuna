import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { projectService } from '../services/projectService'
import { teamService } from '../../teams/services/teamService'
import type { Team } from '../../teams/types/team.types'

export default function CreateProjectPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [projectName, setProjectName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedTeamId, setSelectedTeamId] = useState('')

  const [teams, setTeams] = useState<Team[]>([])
  const [loadingTeams, setLoadingTeams] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const activeUserId = user?.id || 'u1'

  useEffect(() => {
    let isCurrent = true
    teamService
      .getTeamsForUser(activeUserId)
      .then((userTeams) => {
        if (isCurrent) {
          setTeams(userTeams)
          if (userTeams.length > 0) {
            setSelectedTeamId(userTeams[0].id)
          }
          setLoadingTeams(false)
        }
      })
      .catch((err) => {
        if (isCurrent) {
          console.error('Failed to load user teams:', err)
          setLoadingTeams(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [activeUserId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!projectName.trim()) {
      setErrorMsg('Project name is required.')
      return
    }
    if (!description.trim()) {
      setErrorMsg('Project description is required.')
      return
    }
    if (!selectedTeamId) {
      setErrorMsg('Please select an associated team for the project.')
      return
    }

    setSubmitting(true)
    try {
      const created = await projectService.createProject({
        name: projectName,
        description,
        teamId: selectedTeamId
      })

      // Redirect to newly created project workspace
      navigate(`/projects/${created.id}`, { replace: true })
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create project.')
      setSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 className="page-title">Initiate a New Project</h1>
        <p className="page-subtitle">Create a project workspace for your team to track milestones and deliverables.</p>
      </div>

      <div className="module-card" style={{ cursor: 'default' }}>
        {errorMsg && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.75rem 1rem', borderRadius: '0.375rem', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Associated Team Selector */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Assigned Team <span style={{ color: '#ef4444' }}>*</span>
            </label>

            {loadingTeams ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Loading your teams...</p>
            ) : teams.length > 0 ? (
              <select
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                disabled={submitting}
                className="search-input"
                style={{ width: '100%', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}
              >
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name} ({team.members.length} Members)
                  </option>
                ))}
              </select>
            ) : (
              <div style={{ padding: '0.875rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                No active teams found. You must be part of a team to create a project.{' '}
                <button
                  type="button"
                  onClick={() => navigate('/teams/create')}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', cursor: 'pointer', fontWeight: 600 }}
                >
                  Create a team first
                </button>
              </div>
            )}
          </div>

          {/* Project Name Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Project Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Autonomous Drone Navigation / Kizuna v1"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              disabled={submitting}
              required
              className="search-input"
              style={{ width: '100%' }}
            />
          </div>

          {/* Description Textarea */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Project Description <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Provide a detailed summary of the project goals, architecture, scope, and technical requirements..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={submitting}
              required
              className="search-input"
              style={{ width: '100%', resize: 'vertical' }}
            />
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => navigate('/projects')}
              disabled={submitting}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || teams.length === 0}
              className="btn btn-primary"
              style={{ opacity: (submitting || teams.length === 0) ? 0.7 : 1 }}
            >
              {submitting ? 'Creating Project...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
