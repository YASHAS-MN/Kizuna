interface MentorStatCardProps {
  label: string
  value: number | string
  description?: string
  accentColor?: string
  icon?: string
}

/**
 * A single summary stat card for the Mentor Dashboard.
 * Displays a label, numeric value, and optional description.
 */
export default function MentorStatCard({
  label,
  value,
  description,
  accentColor = 'var(--accent-primary)',
  icon
}: MentorStatCardProps) {
  return (
    <div
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '0.875rem',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        transition: 'border-color 0.2s ease'
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.borderColor = accentColor
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--border-color)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        {icon && <span style={{ fontSize: '1.1rem' }}>{icon}</span>}
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em'
          }}
        >
          {label}
        </span>
      </div>

      <span
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: '2.25rem',
          fontWeight: 700,
          color: accentColor,
          lineHeight: 1
        }}
      >
        {value}
      </span>

      {description && (
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{description}</span>
      )}
    </div>
  )
}
