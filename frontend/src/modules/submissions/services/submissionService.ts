import type {
  Submission,
  CreateSubmissionInput,
  UpdateSubmissionInput,
  SubmissionStatus
} from '../types/submission.types'
import { emitActivity } from '../../activity/services/activityService'

type Listener = () => void
const listeners: Set<Listener> = new Set()

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener()
    } catch (err) {
      console.error('Error in submissionService listener:', err)
    }
  })
}

/**
 * In-memory mock submissions store.
 * Seeded with an initial deliverable for project 'p1'.
 */
let mockSubmissions: Submission[] = [
  {
    id: 'sub_1',
    projectId: 'p1',
    title: 'Milestone 1: Architectural Foundation & Threat Model',
    description: 'Formal architectural blueprint, module responsibility boundaries, and threat model specification.',
    submittedBy: 'u1',
    submittedByName: 'Alice Watson',
    status: 'SUBMITTED',
    version: 1,
    createdAt: '2026-08-22T10:00:00.000Z',
    updatedAt: '2026-08-22T14:30:00.000Z',
    submittedAt: '2026-08-22T14:30:00.000Z'
  }
]

export const submissionService = {
  /**
   * Subscribe to submission changes.
   */
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  /**
   * Get all submissions for a project, ordered newest/most recently updated first.
   */
  async getSubmissionsForProject(projectId: string): Promise<Submission[]> {
    await new Promise((resolve) => setTimeout(resolve, 150))
    if (!projectId || !projectId.trim()) {
      return []
    }

    return mockSubmissions
      .filter((s) => s.projectId === projectId.trim())
      .slice()
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .map((s) => ({ ...s }))
  },

  /**
   * Get a single submission by ID.
   */
  async getSubmission(submissionId: string): Promise<Submission | null> {
    await new Promise((resolve) => setTimeout(resolve, 80))
    const item = mockSubmissions.find((s) => s.id === submissionId)
    return item ? { ...item } : null
  },

  /**
   * Create a new submission draft.
   */
  async createSubmission(
    input: CreateSubmissionInput,
    actor?: { id: string; name: string }
  ): Promise<Submission> {
    await new Promise((resolve) => setTimeout(resolve, 150))

    const cleanProjectId = input.projectId?.trim()
    const cleanTitle = input.title?.trim()
    const cleanDesc = input.description?.trim()
    const submittedBy = (input.submittedBy || actor?.id || '').trim() || 'system'
    const submittedByName = (input.submittedByName || actor?.name || '').trim() || 'System'

    if (!cleanProjectId) {
      throw new Error('Project ID is required to create a submission.')
    }
    if (!cleanTitle) {
      throw new Error('Submission title is required.')
    }
    if (!cleanDesc) {
      throw new Error('Submission description is required.')
    }

    const now = new Date().toISOString()
    const newSubmission: Submission = {
      id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      projectId: cleanProjectId,
      title: cleanTitle,
      description: cleanDesc,
      submittedBy,
      submittedByName,
      status: 'DRAFT',
      version: 1,
      createdAt: now,
      updatedAt: now
    }

    mockSubmissions.unshift(newSubmission)

    emitActivity({
      projectId: newSubmission.projectId,
      actorId: newSubmission.submittedBy,
      actorName: newSubmission.submittedByName,
      type: 'SUBMISSION_CREATED',
      message: `created submission draft "${newSubmission.title}"`,
      submissionId: newSubmission.id,
      metadata: { submissionId: newSubmission.id }
    })

    notifyListeners()
    return { ...newSubmission }
  },

  /**
   * Edit an existing submission draft. Only DRAFT submissions can be edited.
   */
  async updateSubmission(
    submissionId: string,
    input: UpdateSubmissionInput,
    actor?: { id: string; name: string }
  ): Promise<Submission> {
    await new Promise((resolve) => setTimeout(resolve, 150))

    const index = mockSubmissions.findIndex((s) => s.id === submissionId)
    if (index === -1) {
      throw new Error('Submission not found.')
    }

    const current = mockSubmissions[index]
    if (current.status !== 'DRAFT') {
      throw new Error('Only draft submissions can be edited.')
    }

    const cleanTitle = input.title?.trim()
    const cleanDesc = input.description?.trim()

    if (!cleanTitle) {
      throw new Error('Submission title is required.')
    }
    if (!cleanDesc) {
      throw new Error('Submission description is required.')
    }

    const now = new Date().toISOString()
    const updated: Submission = {
      ...current,
      title: cleanTitle,
      description: cleanDesc,
      updatedAt: now
    }

    mockSubmissions[index] = updated

    emitActivity({
      projectId: updated.projectId,
      actorId: actor?.id || updated.submittedBy,
      actorName: actor?.name || updated.submittedByName,
      type: 'SUBMISSION_UPDATED',
      message: `updated submission draft "${updated.title}"`,
      submissionId: updated.id,
      metadata: { submissionId: updated.id }
    })

    notifyListeners()
    return { ...updated }
  },

  /**
   * Submit a draft submission. Changes status from DRAFT -> SUBMITTED.
   */
  async submitSubmission(
    submissionId: string,
    actor?: { id: string; name: string }
  ): Promise<Submission> {
    await new Promise((resolve) => setTimeout(resolve, 150))

    const index = mockSubmissions.findIndex((s) => s.id === submissionId)
    if (index === -1) {
      throw new Error('Submission not found.')
    }

    const current = mockSubmissions[index]
    if (current.status !== 'DRAFT') {
      throw new Error('Only draft submissions can be submitted.')
    }

    const now = new Date().toISOString()
    const submitted: Submission = {
      ...current,
      status: 'SUBMITTED',
      submittedAt: now,
      updatedAt: now,
      submittedBy: actor?.id || current.submittedBy,
      submittedByName: actor?.name || current.submittedByName
    }

    mockSubmissions[index] = submitted

    emitActivity({
      projectId: submitted.projectId,
      actorId: submitted.submittedBy,
      actorName: submitted.submittedByName,
      type: 'SUBMISSION_SUBMITTED',
      message: `submitted deliverable "${submitted.title}" (v${submitted.version})`,
      submissionId: submitted.id,
      metadata: {
        submissionId: submitted.id,
        version: String(submitted.version)
      }
    })

    notifyListeners()
    return { ...submitted }
  },

  /**
   * Update the status of a submission. Only for use by the reviewService.
   */
  async updateSubmissionStatus(
    submissionId: string,
    status: SubmissionStatus
  ): Promise<Submission> {
    await new Promise((resolve) => setTimeout(resolve, 50))
    
    const index = mockSubmissions.findIndex((s) => s.id === submissionId)
    if (index === -1) {
      throw new Error('Submission not found.')
    }

    const current = mockSubmissions[index]
    const updated: Submission = {
      ...current,
      status,
      updatedAt: new Date().toISOString()
    }

    mockSubmissions[index] = updated
    notifyListeners()
    return { ...updated }
  }
}
