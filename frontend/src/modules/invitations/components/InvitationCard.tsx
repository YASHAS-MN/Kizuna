import { useState } from 'react'
import type { Invitation } from '../types/invitation.types'
import { invitationService } from '../services/invitationService'

interface InvitationCardProps {
  invitation: Invitation
  onActionComplete?: () => void
}

export default function InvitationCard({ invitation, onActionComplete }: InvitationCardProps) {
  const [loadingAction, setLoadingAction] = useState<'accept' | 'decline' | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  const handleAccept = async () => {
    setLoadingAction('accept')
    setErrorMsg('')
    try {
      await invitationService.acceptInvitation(invitation.id)
      if (onActionComplete) onActionComplete()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to accept invitation.')
    } finally {
      setLoadingAction(null)
    }
  }

  const handleDecline = async () => {
    setLoadingAction('decline')
    setErrorMsg('')
    try {
      await invitationService.declineInvitation(invitation.id)
      if (onActionComplete) onActionComplete()
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to decline invitation.')
    } finally {
      setLoadingAction(null)
    }
  }

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-tertiary)',
        border: '1px solid var(--border-color)',
        borderRadius: '0.625rem',
        padding: '1rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {invitation.senderName}
            </span>
            <span className="badge badge-info" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.7rem' }}>
              {invitation.senderUsn}
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Wants to invite you to join their project team.
          </p>
        </div>

        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          {new Date(invitation.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {errorMsg && (
        <div style={{ fontSize: '0.8rem', color: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '0.4rem 0.6rem', borderRadius: '0.375rem' }}>
          {errorMsg}
        </div>
      )}

      {invitation.status === 'PENDING' ? (
        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.25rem' }}>
          <button
            onClick={handleDecline}
            disabled={loadingAction !== null}
            className="btn btn-secondary"
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', opacity: loadingAction ? 0.7 : 1 }}
          >
            {loadingAction === 'decline' ? 'Declining...' : 'Decline'}
          </button>
          <button
            onClick={handleAccept}
            disabled={loadingAction !== null}
            className="btn btn-primary"
            style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', opacity: loadingAction ? 0.7 : 1 }}
          >
            {loadingAction === 'accept' ? 'Accepting...' : 'Accept'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <span className={`badge ${invitation.status === 'ACCEPTED' ? 'badge-success' : 'badge-warning'}`}>
            {invitation.status}
          </span>
        </div>
      )}
    </div>
  )
}
