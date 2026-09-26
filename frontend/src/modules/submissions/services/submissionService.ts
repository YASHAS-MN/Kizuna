import type {
  Submission,
  CreateSubmissionInput,
  UpdateSubmissionInput,
  SubmissionStatus
} from '../types/submission.types'
import {
  fetchSubmissionsForProjectApi,
  fetchSubmissionByIdApi,
  createSubmissionApi,
  updateSubmissionApi,
  submitSubmissionApi
} from '../../../services/api/submissions'

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

export const submissionService = {
  /**
   * Subscribe to submission changes (local notifications only; mutations
   * now persist through the backend).
   */
  subscribe(listener: Listener): () => void {
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  },

  /**
   * Get all submissions for a project, newest first.
   * Authorization is enforced on the backend via the authenticated session.
   */
  async getSubmissionsForProject(projectId: string): Promise<Submission[]> {
    if (!projectId || !projectId.trim()) return []
    return fetchSubmissionsForProjectApi(projectId.trim())
  },

  /**
   * Get a single submission by ID.
   * Returns null if not found or not accessible.
   */
  async getSubmission(submissionId: string): Promise<Submission | null> {
    try {
      return await fetchSubmissionByIdApi(submissionId)
    } catch {
      return null
    }
  },

  /**
   * Create a new submission draft.
   * submittedBy / submittedByName are derived from the authenticated session on the backend.
   */
  async createSubmission(
    input: CreateSubmissionInput,
    _actor?: { id: string; name: string }
  ): Promise<Submission> {
    const cleanProjectId = input.projectId?.trim()
    if (!cleanProjectId) throw new Error('Project ID is required to create a submission.')

    const cleanTitle = input.title?.trim()
    const cleanDesc = input.description?.trim()
    if (!cleanTitle) throw new Error('Submission title is required.')
    if (!cleanDesc) throw new Error('Submission description is required.')

    const created = await createSubmissionApi({
      projectId: cleanProjectId,
      title: cleanTitle,
      description: cleanDesc
    })

    notifyListeners()
    return created
  },

  /**
   * Edit an existing submission draft. Only DRAFT submissions can be edited.
   * Lifecycle enforcement is also done on the backend.
   */
  async updateSubmission(
    submissionId: string,
    input: UpdateSubmissionInput,
    _actor?: { id: string; name: string }
  ): Promise<Submission> {
    const cleanTitle = input.title?.trim()
    const cleanDesc = input.description?.trim()
    if (!cleanTitle) throw new Error('Submission title is required.')
    if (!cleanDesc) throw new Error('Submission description is required.')

    const updated = await updateSubmissionApi(submissionId, {
      title: cleanTitle,
      description: cleanDesc
    })

    notifyListeners()
    return updated
  },

  /**
   * Submit a draft submission. Changes status from DRAFT → SUBMITTED.
   */
  async submitSubmission(
    submissionId: string,
    _actor?: { id: string; name: string }
  ): Promise<Submission> {
    const submitted = await submitSubmissionApi(submissionId)
    notifyListeners()
    return submitted
  },

  /**
   * Update the status of a submission.
   * This operation belongs to the Review domain (SUBMITTED → UNDER_REVIEW → REVIEWED).
   * It will be implemented by the Review backend slice.
   */
  async updateSubmissionStatus(
    _submissionId: string,
    _status: SubmissionStatus
  ): Promise<Submission> {
    throw new Error(
      'updateSubmissionStatus is not available in the Submission slice. ' +
      'The Review backend slice must provide SUBMITTED → UNDER_REVIEW → REVIEWED transitions.'
    )
  }
}
