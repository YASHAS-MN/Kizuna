import React, { useState, useEffect } from 'react'
import type { StudentPublicProfile } from '../types/student.types'
import { useAuth } from '../../../context/AuthContext'
import { invitationService } from '../../invitations/services/invitationService'

interface StudentCardProps {
  student: StudentPublicProfile
  onSelect: (student: StudentPublicProfile) => void
}

export default function StudentCard({ student, onSelect }: StudentCardProps) {
  const { user } = useAuth()
  const [isPending, setIsPending] = useState(false)
  const [isInviting, setIsInviting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // Check if target is the currently authenticated user
  const isSelf = user ? (user.email === student.email || user.name === student.name) : false
  const activeUserId = user?.id || 'u_active'
  const activeUserName = user?.name || 'Active Student'
  const activeUserUsn = '1RV23CS000' // Default seat number for current user session

  useEffect(() => {
    let isCurrent = true
    invitationService
      .hasPendingInvitation(activeUserId, student.id)
      .then((pending) => {
        if (isCurrent) {
          setIsPending(pending)
        }
      })
      .catch((err) => console.error('Failed to check invitation status:', err))

    // Subscribe to global invitation changes
    const unsubscribe = invitationService.subscribe(() => {
      invitationService
        .hasPendingInvitation(activeUserId, student.id)
        .then((pending) => {
          if (isCurrent) setIsPending(pending)
        })
    })

    return () => {
      isCurrent = false
      unsubscribe()
    }
  }, [activeUserId, student.id])

  const handleInviteClick = async (e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering parent modal click
    setErrorMsg('')
    setIsInviting(true)

    try {
      await invitationService.sendInvitation(
        { id: activeUserId, name: activeUserName, usn: activeUserUsn },
        { id: student.id, name: student.name, usn: student.usn }
      )
      setIsPending(true)
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not send invitation.')
    } finally {
      setIsInviting(false)
    }
  }

  return (
    <div
      className="module-card"
      onClick={() => onSelect(student)}
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '1rem',
        padding: '1.5rem',
        cursor: 'pointer'
      }}
    >
      <div>
        {/* Top Header: Avatar + USN Badge */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
          <div style={{ width: '2.75rem', height: '2.75rem', borderRadius: '9999px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem', color: 'white', boxShadow: '0 4px 10px rgba(99, 102, 241, 0.2)' }}>
            {student.avatarInitials}
          </div>
          <span className="badge badge-info" style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>
            {student.usn}
          </span>
        </div>

        {/* Student Identity */}
        <h3 className="module-title" style={{ fontSize: '1.2rem', marginBottom: '0.25rem' }}>
          {student.name}
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', fontWeight: 500, marginBottom: '0.5rem' }}>
          {student.department} • {student.year}
        </p>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginBottom: '1rem' }}>
          {student.bio}
        </p>

        {/* Skill Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
          {student.skills.map((skill, index) => (
            <span key={index} className="skill-tag">
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Footer Action Area */}
      <div>
        {errorMsg && (
          <p style={{ fontSize: '0.75rem', color: '#ef4444', marginBottom: '0.5rem' }}>
            {errorMsg}
          </p>
        )}

        <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Click for profile</span>
          
          {isSelf ? (
            <span className="badge badge-info" style={{ fontSize: '0.75rem' }}>
              Your Profile
            </span>
          ) : isPending ? (
            <span className="badge badge-success" style={{ fontSize: '0.75rem' }}>
              Invitation Sent
            </span>
          ) : (
            <button
              onClick={handleInviteClick}
              disabled={isInviting}
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem', opacity: isInviting ? 0.7 : 1 }}
            >
              {isInviting ? 'Sending...' : 'Invite to Team'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
