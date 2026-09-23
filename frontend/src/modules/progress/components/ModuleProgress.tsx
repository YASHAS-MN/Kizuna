import type { ModuleProgress as ModuleProgressType } from '../types/progress.types'

interface ModuleProgressProps {
  modules: ModuleProgressType[]
}

export default function ModuleProgress({ modules }: ModuleProgressProps) {
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
          Module Progress
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          Completion rates across project architectural areas and workstreams
        </p>
      </div>

      {modules.length === 0 ? (
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
          No modules identified yet. Create tasks with module tags to track workstreams.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {modules.map((mod) => (
            <div
              key={mod.module}
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
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent-primary)',
                      display: 'inline-block'
                    }}
                  />
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                    {mod.module}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {mod.completedTasks} / {mod.totalTasks}
                  </span>
                  <span
                    style={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: mod.completionPercentage === 100 ? 'var(--success)' : 'var(--text-primary)',
                      minWidth: '40px',
                      textAlign: 'right'
                    }}
                  >
                    {mod.completionPercentage}%
                  </span>
                </div>
              </div>

              {/* Module Progress Bar */}
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
                    width: `${mod.completionPercentage}%`,
                    backgroundColor:
                      mod.completionPercentage === 100 ? 'var(--success)' : 'var(--accent-primary)',
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
