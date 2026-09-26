import { SubmissionRepository } from '../repositories/submission.repository.js';
import { Submission, SubmissionStatus } from '../models/submission.js';

export class SubmissionService {
  constructor(private submissionRepository: SubmissionRepository) {}

  async getSubmissionsForProject(projectId: string): Promise<Submission[]> {
    return this.submissionRepository.findByProjectId(projectId);
  }

  async getSubmissionById(id: string): Promise<Submission | null> {
    return this.submissionRepository.findById(id);
  }

  async createSubmission(submission: Submission): Promise<Submission> {
    return this.submissionRepository.create(submission);
  }

  async updateSubmission(id: string, updates: Partial<Submission>): Promise<Submission | null> {
    return this.submissionRepository.update(id, updates);
  }

  async submitSubmission(id: string): Promise<Submission | null> {
    const now = new Date().toISOString();
    return this.submissionRepository.updateStatus(id, 'SUBMITTED', { submittedAt: now, updatedAt: now });
  }

  /**
   * Update submission status — for use by the review workflow only.
   */
  async updateSubmissionStatus(id: string, status: SubmissionStatus): Promise<Submission | null> {
    return this.submissionRepository.updateStatus(id, status);
  }
}
