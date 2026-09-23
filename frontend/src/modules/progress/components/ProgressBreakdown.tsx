import type { MemberProgress as MemberProgressType } from '../types/progress.types'

interface ProgressBreakdownProps {
  members: MemberProgressType[]
}

export default function ProgressBreakdown({ members }: ProgressBreakdownProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '0.875rem',
        padding: '1.75rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem'
      }}
    >
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          Team Member Breakdown
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Individual task execution rates and completion across assigned team members
        </p>
      </div>

      {members.length === 0 ? (
        <div
          style={{
            padding: '2rem 1rem',
            textAlign: 'center',
            backgroundColor: 'var(--bg-tertiary)',
            borderRadius: '0.5rem',
            border: '1px dashed var(--border-color)',
            color: 'var(--text-muted)',
            fontSize: '0.875rem'
          }}
        >
          No assigned tasks yet. Assign tasks to team members to see individual progress tracking.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {members.map((member) => (
            <div
              key={member.memberId}
              style={{
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '0.625rem',
                padding: '1rem 1.25rem',
                border: '1px solid var(--border-color)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(139, 92, 246, 0.25) 100%)',
                      border: '1px solid rgba(99, 102, 241, 0.35)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--accent-primary)'
                    }}
                  >
                    {member.memberName ? member.memberName.charAt(0).toUpperCase() : '?'}
                  </div>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    {member.memberName}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {member.completedTasks} / {member.totalTasks}
                  </span>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: member.completionPercentage === 100 ? 'var(--success)' : 'var(--text-primary)',
                      minWidth: '40px',
                      textAlign: 'right'
                    }}
                  >
                    {member.completionPercentage}%
                  </span>
                </div>
              </div>

              {/* Member Progress Bar */}
              <div
                style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: 'rgba(255, 255, 255, 0.06)',
                  borderRadius: '9999px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${member.completionPercentage}%`,
                    backgroundColor:
                      member.completionPercentage === 100 ? 'var(--success)' : 'var(--accent-secondary)',
                    borderRadius: '9999px',
                    transition: 'width 0.3s ease'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
