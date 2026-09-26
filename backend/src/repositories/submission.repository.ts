import { Submission, SubmissionStatus } from '../models/submission.js';

export interface SubmissionRepository {
  findByProjectId(projectId: string): Promise<Submission[]>;
  findById(id: string): Promise<Submission | null>;
  create(submission: Submission): Promise<Submission>;
  update(id: string, updates: Partial<Submission>): Promise<Submission | null>;
  updateStatus(id: string, status: SubmissionStatus, extra?: { submittedAt?: string; updatedAt?: string }): Promise<Submission | null>;
}
