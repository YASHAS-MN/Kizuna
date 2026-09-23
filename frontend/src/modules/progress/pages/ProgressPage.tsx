import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { progressService } from '../services/progressService'
import type { ProgressSnapshot } from '../types/progress.types'
import ProgressSummary from '../components/ProgressSummary'
import ModuleProgress from '../components/ModuleProgress'
import ProgressBreakdown from '../components/ProgressBreakdown'

interface ProgressPageProps {
  projectId?: string
}

export default function ProgressPage({ projectId: propProjectId }: ProgressPageProps) {
  const { projectId: routeProjectId } = useParams<{ projectId: string }>()
  const projectId = propProjectId || routeProjectId

  const [snapshot, setSnapshot] = useState<ProgressSnapshot | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [errorMsg, setErrorMsg] = useState<string>('')

  const loadProgress = useCallback(async () => {
    if (!projectId) {
      setErrorMsg('No project ID was provided.')
      setLoading(false)
      return
    }

    try {
      setErrorMsg('')
      const data = await progressService.getProjectProgress(projectId)
      setSnapshot(data)
    } catch (err) {
      console.error('Failed to load project progress snapshot:', err)
      setErrorMsg('Failed to calculate project progress metrics.')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    setLoading(true)
    loadProgress()

    const unsubscribe = progressService.subscribe(() => {
      loadProgress()
    })

    return () => {
      unsubscribe()
    }
  }, [loadProgress])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        Calculating project progress metrics...
      </div>
    )
  }

  if (errorMsg || !snapshot) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '3rem 1.5rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '0.75rem',
          border: '1px solid var(--border-color)'
        }}
      >
        <h2 style={{ fontSize: '1.25rem', color: '#ef4444', marginBottom: '0.5rem' }}>
          {errorMsg || 'Unable to load progress data'}
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem' }}>
          An error occurred while deriving project milestone metrics.
        </p>
        <button onClick={() => loadProgress()} className="btn btn-secondary">
          Retry
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h2 className="page-title" style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>
          Project Progress
        </h2>
        <p className="page-subtitle" style={{ margin: 0 }}>
          Real-time execution metrics and completion rates derived directly from active project tasks.
        </p>
      </div>

      {/* Overall Summary Card */}
      <ProgressSummary summary={snapshot.overall} />

      {/* Module and Member Breakdown Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}
      >
        <ModuleProgress modules={snapshot.modules} />
        <ProgressBreakdown members={snapshot.members} />
      </div>
    </div>
  )
}
