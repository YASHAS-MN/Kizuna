import { useCallback, useEffect, useState } from 'react'
import type { ActivityEvent } from '../types/activity.types'
import { activityService } from '../services/activityService'
import ActivityItem from './ActivityItem'

interface ActivityTimelineProps {
  projectId: string
}

function dayLabel(iso: string): string {
  const date = new Date(iso)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Today'
  if (date.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
}

function groupByDay(events: ActivityEvent[]): { label: string; events: ActivityEvent[] }[] {
  const groups: { label: string; events: ActivityEvent[] }[] = []
  for (const event of events) {
    const label = dayLabel(event.createdAt)
    const last = groups[groups.length - 1]
    if (last && last.label === label) {
      last.events.push(event)
    } else {
      groups.push({ label, events: [event] })
    }
  }
  return groups
}

export default function ActivityTimeline({ projectId }: ActivityTimelineProps) {
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')

  const loadActivity = useCallback(async () => {
    if (!projectId) {
      setErrorMsg('A valid project ID is required to load activity.')
      setEvents([])
      setLoading(false)
      return
    }

    try {
      const data = await activityService.getProjectActivity(projectId)
      setEvents(data)
      setErrorMsg('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load project activity.'
      setErrorMsg(message)
      setEvents([])
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    setLoading(true)
    loadActivity()
    const unsubscribe = activityService.subscribe(() => {
      loadActivity()
    })
    return () => unsubscribe()
  }, [loadActivity])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
        Loading project activity...
      </div>
    )
  }

  if (errorMsg) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '2.5rem 1.5rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '0.75rem',
          border: '1px solid var(--border-color)'
        }}
      >
        <h3 style={{ fontSize: '1.1rem', color: '#ef4444', marginBottom: '0.5rem' }}>{errorMsg}</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.9rem' }}>
          Activity could not be loaded for this project.
        </p>
        <button onClick={() => { setLoading(true); loadActivity() }} className="btn btn-secondary">
          Retry
        </button>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '3rem 1.5rem',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '0.75rem',
          border: '1px dashed var(--border-color)'
        }}
      >
        <h3 style={{ fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.4rem' }}>
          No activity yet
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '420px', margin: '0 auto' }}>
          Task updates, assignments, and comments will appear here as the team works on this project.
        </p>
      </div>
    )
  }

  const groups = groupByDay(events)

  return (
    <div
      style={{
        backgroundColor: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: '0.75rem',
        padding: '0.5rem 1.5rem 1rem'
      }}
    >
      {groups.map((group) => (
        <section key={group.label} style={{ paddingTop: '1rem' }}>
          <h3
            style={{
              fontSize: '0.75rem',
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--text-muted)',
              margin: '0 0 0.25rem',
              fontWeight: 700
            }}
          >
            {group.label}
          </h3>
          <div style={{ borderLeft: '2px solid var(--border-color)', marginLeft: '1.05rem', paddingLeft: '0.25rem' }}>
            {group.events.map((event) => (
              <div key={event.id} style={{ paddingLeft: '0.5rem' }}>
                <ActivityItem event={event} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
