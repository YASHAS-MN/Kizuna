import React, { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { commentService } from '../services/commentService'

interface CommentComposerProps {
  taskId: string
}

export default function CommentComposer({ taskId }: CommentComposerProps) {
  const { user } = useAuth()
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')

    if (!content.trim()) {
      setErrorMsg('Comment cannot be empty.')
      return
    }

    if (!user?.id || !user.name) {
      setErrorMsg('You must be signed in to post a comment.')
      return
    }

    setSubmitting(true)
    try {
      await commentService.addComment(taskId, { id: user.id, name: user.name }, content)
      setContent('')
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to post comment.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
      {errorMsg && (
        <div
          style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            padding: '0.5rem 0.75rem',
            borderRadius: '0.375rem',
            fontSize: '0.8rem'
          }}
        >
          {errorMsg}
        </div>
      )}
      <textarea
        rows={3}
        placeholder="Write a comment..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={submitting}
        className="search-input"
        style={{ width: '100%', resize: 'vertical' }}
      />
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="submit"
          disabled={submitting || !content.trim()}
          className="btn btn-primary"
          style={{ padding: '0.4rem 0.9rem', fontSize: '0.85rem', opacity: submitting || !content.trim() ? 0.7 : 1 }}
        >
          {submitting ? 'Posting...' : 'Post Comment'}
        </button>
      </div>
    </form>
  )
}
