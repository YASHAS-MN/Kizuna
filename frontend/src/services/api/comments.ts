import { API_BASE_URL } from './config'
import type { Comment } from '../../modules/comments/types/comment.types'
import { UnauthorizedError } from '../../modules/authorization/types/authorization.types'

export async function fetchCommentsForTaskApi(taskId: string): Promise<Comment[]> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/comments`, {
    method: 'GET',
    credentials: 'include'
  })

  if (!response.ok) {
    if (response.status === 403 || response.status === 401) throw new UnauthorizedError()
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'Failed to fetch comments')
  }

  return response.json()
}

export async function createCommentApi(taskId: string, content: string): Promise<Comment> {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
    credentials: 'include'
  })

  if (!response.ok) {
    if (response.status === 403 || response.status === 401) throw new UnauthorizedError()
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'Failed to post comment')
  }

  return response.json()
}

export async function deleteCommentApi(commentId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/comments/${commentId}`, {
    method: 'DELETE',
    credentials: 'include'
  })

  if (!response.ok) {
    if (response.status === 403 || response.status === 401) throw new UnauthorizedError()
    const errorData = await response.json().catch(() => ({}))
    throw new Error(errorData.message || 'Failed to delete comment')
  }
}
