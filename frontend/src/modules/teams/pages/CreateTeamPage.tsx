import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import { teamService } from '../services/teamService'
import { invitationService } from '../../invitations/services/invitationService'
import type { InvitationUser } from '../../invitations/types/invitation.types'

export default function CreateTeamPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [teamName, setTeamName] = useState('')
  const [collaborators, setCollaborators] = useState<InvitationUser[]>([])
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

  const [loadingCollabs, setLoadingCollabs] = useState(true)
  const [formSubmitting, setFormSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const activeUserId = user?.id || 'u1'
  const activeUserName = user?.name || 'Active Student'
  const activeUserUsn = '1RV23CS000'

  useEffect(() => {
    let isCurrent = true
    invitationService
      .getAcceptedCollaborators(activeUserId)
      .then((collabs) => {
        if (isCurrent) {
          setCollaborators(collabs)
          setLoadingCollabs(false)
        }
      })
      .catch((err) => {
        if (isCurrent) {
          console.error('Failed to load accepted collaborators:', err)
          setLoadingCollabs(false)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [activeUserId])

  const toggleCollaborator = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!teamName.trim()) {
      setErrorMsg('Please provide a valid team name.')
      return
    }

    setFormSubmitting(true)
    try {
      const selectedMembers = collaborators.filter((c) => selectedUserIds.includes(c.id))

      const createdTeam = await teamService.createTeam(
        teamName,
        { id: activeUserId, name: activeUserName, usn: activeUserUsn },
        selectedMembers
      )

      // Redirect to newly created team workspace
      navigate(`/teams/${createdTeam.id}`, { replace: true })
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create team.')
      setFormSubmitting(false)
    }
  }

  return (
    <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 className="page-title">Form a New Project Team</h1>
        <p className="page-subtitle">Assemble a team workspace and invite accepted student collaborators.</p>
      </div>

      <div className="module-card" style={{ cursor: 'default' }}>
        {errorMsg && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '0.75rem 1rem', borderRadius: '0.375rem', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Team Name Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Team Name <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Team Gamma / NextGen AI Lab"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              disabled={formSubmitting}
              required
              className="search-input"
              style={{ width: '100%' }}
            />
          </div>

          {/* Collaborator Selection */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Select Accepted Collaborators
              </label>
              <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
                {selectedUserIds.length} Selected
              </span>
            </div>

            {loadingCollabs ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Loading eligible collaborators...</p>
            ) : collaborators.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '240px', overflowY: 'auto' }}>
                {collaborators.map((collab) => {
                  const isChecked = selectedUserIds.includes(collab.id)
                  return (
                    <div
                      key={collab.id}
                      onClick={() => toggleCollaborator(collab.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.75rem 1rem',
                        backgroundColor: isChecked ? 'rgba(99, 102, 241, 0.12)' : 'var(--bg-tertiary)',
                        border: `1px solid ${isChecked ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}} // handled by parent div onClick
                          style={{ width: '1rem', height: '1rem', cursor: 'pointer' }}
                        />
                        <div>
                          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                            {collab.name}
                          </span>
                          <span style={{ marginLeft: '0.5rem', fontSize: '0.8rem', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
                            {collab.usn}
                          </span>
                        </div>
                      </div>

                      <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>
                        Accepted Connection
                      </span>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                No accepted collaborators found yet. You can still create a team and invite members later!
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={() => navigate('/teams')}
              disabled={formSubmitting}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formSubmitting}
              className="btn btn-primary"
              style={{ opacity: formSubmitting ? 0.7 : 1 }}
            >
              {formSubmitting ? 'Creating Team...' : 'Create Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
