export type SubmissionStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'REVIEWED';

export interface Submission {
  id: string;
  projectId: string;
  title: string;
  description: string;
  submittedBy: string;
  submittedByName: string;
  status: SubmissionStatus;
  version: number;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export interface CreateSubmissionInput {
  title: string;
  description: string;
}

export interface UpdateSubmissionInput {
  title: string;
  description: string;
}
