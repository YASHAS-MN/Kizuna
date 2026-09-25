import type { Comment, CommentAuthor } from '../types/comment.types'
import { taskService } from '../../tasks/services/taskService'
import { emitActivity } from '../../activity/services/activityService'
import { fetchCommentsForTaskApi, createCommentApi, deleteCommentApi } from '../../../services/api/comments'

type Listener = () => void
const listeners: Set<Listener> = new Set()

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

export const commentService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  async getCommentsForTask(taskId: string): Promise<Comment[]> {
    if (!taskId?.trim()) {
      throw new Error('A valid task ID is required to load comments.')
    }
    return fetchCommentsForTaskApi(taskId)
  },

  async addComment(taskId: string, author: CommentAuthor, content: string): Promise<Comment> {
    const cleanContent = content.trim()
    if (!cleanContent) {
      throw new Error('Comment cannot be empty.')
    }

    const created = await createCommentApi(taskId, cleanContent)
    notifyListeners()

    // Emit activity notification
    taskService.getTask(taskId).then((task) => {
      if (task) {
        emitActivity({
          projectId: task.projectId,
          actorId: author?.id || created.authorId,
          actorName: author?.name || created.authorName,
          type: 'COMMENT_ADDED',
          message: `commented on "${task.title}"`,
          taskId: task.id
        })
      }
    }).catch(() => {
      // Activity emit is non-blocking
    })

    return created
  },

  async deleteComment(commentId: string, actor?: CommentAuthor, taskId?: string): Promise<boolean> {
    await deleteCommentApi(commentId)
    notifyListeners()

    if (taskId) {
      taskService.getTask(taskId).then((task) => {
        if (task) {
          emitActivity({
            projectId: task.projectId,
            actorId: actor?.id || '',
            actorName: actor?.name || '',
            type: 'COMMENT_DELETED',
            message: `deleted a comment on "${task.title}"`,
            taskId: task.id
          })
        }
      }).catch(() => {
        // Activity emit is non-blocking
      })
    }

    return true
  }
}
