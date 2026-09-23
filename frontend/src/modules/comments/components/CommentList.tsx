import { useCallback, useEffect, useState } from 'react'
import type { Comment } from '../types/comment.types'
import { commentService } from '../services/commentService'
import { useAuth } from '../../../context/AuthContext'
import CommentComposer from './CommentComposer'

interface CommentListProps {
  taskId: string
}

function formatCommentTime(iso: string): string {
  const date = new Date(iso)
  return `${date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} · ${date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
}

export default function CommentList({ taskId }: CommentListProps) {
  const { user } = useAuth()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const loadComments = useCallback(async () => {
    if (!taskId) {
      setErrorMsg('A valid task ID is required to load comments.')
      setComments([])
      setLoading(false)
      return
    }

    try {
      const data = await commentService.getCommentsForTask(taskId)
      setComments(data)
      setErrorMsg('')
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to load comments.'
      setErrorMsg(message)
      setComments([])
    } finally {
      setLoading(false)
    }
  }, [taskId])

  useEffect(() => {
    setLoading(true)
    loadComments()
    const unsubscribe = commentService.subscribe(() => {
      loadComments()
    })
    return () => unsubscribe()
  }, [loadComments])

  const handleDelete = async (commentId: string) => {
    setDeletingId(commentId)
    try {
      await commentService.deleteComment(
        commentId,
        user ? { id: user.id, name: user.name } : undefined
      )
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to delete comment.'
      setErrorMsg(message)
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      <h4
        style={{
          fontSize: '0.8rem',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
          letterSpacing: '0.05em',
          marginBottom: '0.75rem'
        }}
      >
        Comments
      </h4>

      {loading && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          Loading comments...
        </p>
      )}

      {errorMsg && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '0.625rem 0.875rem',
            borderRadius: '0.375rem',
            fontSize: '0.85rem',
            marginBottom: '0.875rem'
          }}
        >
          {errorMsg}
        </div>
      )}

      {!loading && !errorMsg && comments.length === 0 && (
        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>
          No comments yet. Start the discussion for this task.
        </p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.25rem' }}>
        {comments.map((comment) => {
          const initials = comment.authorName
            .split(' ')
            .filter(Boolean)
            .map((part) => part[0])
            .join('')
            .slice(0, 2)
            .toUpperCase()

          return (
            <div
              key={comment.id}
              style={{
                display: 'flex',
                gap: '0.75rem',
                padding: '0.75rem',
                backgroundColor: 'var(--bg-tertiary)',
                borderRadius: '0.5rem',
                border: '1px solid var(--border-color)'
              }}
            >
              <div
                style={{
                  width: '2rem',
                  height: '2rem',
                  borderRadius: '9999px',
                  background: 'var(--accent-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: 'white',
                  flexShrink: 0
                }}
              >
                {initials || '?'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', alignItems: 'baseline' }}>
                  <span style={{ fontWeight: 650, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                    {comment.authorName}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                    {formatCommentTime(comment.createdAt)}
                  </span>
                </div>
                <p style={{ margin: '0.3rem 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.45 }}>
                  {comment.content}
                </p>
                <button
                  type="button"
                  onClick={() => handleDelete(comment.id)}
                  disabled={deletingId === comment.id}
                  style={{
                    marginTop: '0.45rem',
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    color: 'var(--text-muted)',
                    fontSize: '0.75rem',
                    cursor: deletingId === comment.id ? 'default' : 'pointer'
                  }}
                >
                  {deletingId === comment.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          )
        })}
      </div>

      <CommentComposer taskId={taskId} />
    </div>
  )
}
