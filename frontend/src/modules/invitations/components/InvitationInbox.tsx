import { useState, useEffect, useCallback } from 'react'
import type { Invitation } from '../types/invitation.types'
import { invitationService } from '../services/invitationService'
import InvitationCard from './InvitationCard'
import { useAuth } from '../../../context/AuthContext'

interface InvitationInboxProps {
  onCountChange?: (count: number) => void
}

export default function InvitationInbox({ onCountChange }: InvitationInboxProps) {
  const { user } = useAuth()
  const [invitations, setInvitations] = useState<Invitation[]>([])
  const [loading, setLoading] = useState(true)

  const loadInvitations = useCallback(async () => {
    const currentUserId = user?.id || 'u1'
    try {
      const data = await invitationService.getReceivedInvitations(currentUserId)
      // Keep pending invitations at top
      const pendingOnly = data.filter((inv) => inv.status === 'PENDING')
      setInvitations(pendingOnly)
      if (onCountChange) {
        onCountChange(pendingOnly.length)
      }
    } catch (err) {
      console.error('Error fetching invitations:', err)
    } finally {
      setLoading(false)
    }
  }, [user, onCountChange])

  useEffect(() => {
    loadInvitations()
    // Subscribe to real-time service updates
    const unsubscribe = invitationService.subscribe(() => {
      loadInvitations()
    })
    return () => unsubscribe()
  }, [loadInvitations])

  if (loading) {
    return (
      <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', padding: '1rem 0' }}>
        Loading invitations...
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {invitations.length > 0 ? (
        invitations.map((inv) => (
          <InvitationCard key={inv.id} invitation={inv} onActionComplete={loadInvitations} />
        ))
      ) : (
        <div
          style={{
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px border-color',
            borderRadius: '0.5rem',
            padding: '1.5rem 1rem',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '0.875rem'
          }}
        >
          <p style={{ fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            No pending team invitations
          </p>
          <p style={{ fontSize: '0.8rem' }}>
            When classmates invite you to join their project teams, requests will appear here.
          </p>
        </div>
      )}
    </div>
  )
}
