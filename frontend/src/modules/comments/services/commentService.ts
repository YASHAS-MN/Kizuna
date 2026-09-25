import type { Comment, CommentAuthor } from '../types/comment.types'
import { taskService } from '../../tasks/services/taskService'
import { emitActivity } from '../../activity/services/activityService'
import { projectService } from '../../projects/services/projectService'
import { teamService } from '../../teams/services/teamService'
import { authorizationService } from '../../authorization/services/authorizationService'

let mockComments: Comment[] = [
  {
    id: 'c_1',
    taskId: 't_1',
    authorId: 'u1',
    authorName: 'Alice Watson',
    content: 'Can you verify the API response format?',
    createdAt: '2026-08-20T10:12:00.000Z'
  },
  {
    id: 'c_2',
    taskId: 't_1',
    authorId: 's2',
    authorName: 'Bob Jenkins',
    content: "Yes, I'll check it today.",
    createdAt: '2026-08-20T10:35:00.000Z'
  }
]

type Listener = () => void
const listeners: Set<Listener> = new Set()

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

/**
 * Replaceable Service Boundary for task comments.
 * NOTE: In-memory mock. A future slice will persist comments via API.
 */
export const commentService = {
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  async getCommentsForTask(taskId: string): Promise<Comment[]> {
    await new Promise((resolve) => setTimeout(resolve, 150))

    if (!taskId?.trim()) {
      throw new Error('A valid task ID is required to load comments.')
    }

    const task = await taskService.getTask(taskId) // getTask enforces read access
    if (!task) {
      throw new Error(`Task with ID "${taskId}" was not found.`)
    }

    return mockComments
      .filter((comment) => comment.taskId === taskId)
      .slice()
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((comment) => ({ ...comment }))
  },

  async addComment(taskId: string, author: CommentAuthor, content: string): Promise<Comment> {
    await new Promise((resolve) => setTimeout(resolve, 200))

    const cleanContent = content.trim()
    if (!cleanContent) {
      throw new Error('Comment cannot be empty.')
    }

    const authorId = author?.id?.trim()
    const authorName = author?.name?.trim()
    if (!authorId || !authorName) {
      throw new Error('A valid comment author is required.')
    }

    // Verify task exists and actor can write comments (derives from project membership)
    const task = await taskService.getTask(taskId) // getTask enforces read access
    if (!task) {
      throw new Error(`Cannot add a comment: task "${taskId}" does not exist.`)
    }

    // AUTHORIZATION: must be able to modify project resources
    const project = await projectService.getProject(task.projectId)
    if (!project) throw new Error('Project not found')
    const team = await teamService.getTeam(project.teamId)
    if (!team) throw new Error('Team not found')
    authorizationService.assertCanModifyProjectResources(project, team)

    const newComment: Comment = {
      id: `c_${Date.now()}`,
      taskId: task.id,
      authorId,
      authorName,
      content: cleanContent,
      createdAt: new Date().toISOString()
    }

    mockComments.push(newComment)
    notifyListeners()

    emitActivity({
      projectId: task.projectId,
      actorId: authorId,
      actorName: authorName,
      type: 'COMMENT_ADDED',
      message: `commented on "${task.title}"`,
      taskId: task.id
    })

    return { ...newComment }
  },

  async deleteComment(commentId: string, actor?: CommentAuthor): Promise<boolean> {
    await new Promise((resolve) => setTimeout(resolve, 150))

    const index = mockComments.findIndex((comment) => comment.id === commentId)
    if (index === -1) {
      throw new Error('Comment not found.')
    }

    const [removed] = mockComments.splice(index, 1)
    notifyListeners()

    const task = await taskService.getTask(removed.taskId) // Enforces read access on task
    if (task) {
      // AUTHORIZATION: check caller can modify project resources
      const project = await projectService.getProject(task.projectId)
      if (!project) throw new Error('Project not found')
      const team = await teamService.getTeam(project.teamId)
      if (!team) throw new Error('Team not found')
      authorizationService.assertCanModifyProjectResources(project, team)

      emitActivity({
        projectId: task.projectId,
        actorId: actor?.id || removed.authorId,
        actorName: actor?.name || removed.authorName,
        type: 'COMMENT_DELETED',
        message: `deleted a comment on "${task.title}"`,
        taskId: task.id
      })
    }

    return true
  }
}
