import { User } from '../models/user.js';
import { TeamRepository } from '../repositories/team.repository.js';
import { ProjectRepository } from '../repositories/project.repository.js';
import { TaskRepository } from '../repositories/task.repository.js';
import { CommentRepository } from '../repositories/comment.repository.js';
import { SubmissionRepository } from '../repositories/submission.repository.js';
import { ReviewRepository } from '../repositories/review.repository.js';

export class AuthorizationService {
  constructor(
    private teamRepository: TeamRepository,
    private projectRepository: ProjectRepository,
    private taskRepository: TaskRepository,
    private commentRepository?: CommentRepository,
    private submissionRepository?: SubmissionRepository,
    private reviewRepository?: ReviewRepository
  ) {}

  async canAccessTeam(user: User, teamId: string): Promise<boolean> {
    if (user.role === 'STUDENT') {
      const members = await this.teamRepository.findMembersByTeamId(teamId);
      return members.some(m => m.userId === user.id);
    } else if (user.role === 'MENTOR') {
      const team = await this.teamRepository.findById(teamId);
      return team?.mentorId === user.id;
    }
    return false;
  }

  async canAccessProject(user: User, projectId: string): Promise<boolean> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) return false;
    return this.canAccessTeam(user, project.teamId);
  }

  async canModifyTeam(user: User, teamId: string): Promise<boolean> {
    if (user.role === 'STUDENT') {
      return this.canAccessTeam(user, teamId);
    }
    return false; // Mentors cannot modify
  }

  async canModifyProject(user: User, projectId: string): Promise<boolean> {
    if (user.role === 'STUDENT') {
      return this.canAccessProject(user, projectId);
    }
    return false; // Mentors cannot modify
  }

  async canAccessTask(user: User, taskId: string): Promise<boolean> {
    const task = await this.taskRepository.findById(taskId);
    if (!task) return false;
    return this.canAccessProject(user, task.projectId);
  }

  async canModifyTask(user: User, taskId: string): Promise<boolean> {
    if (user.role === 'STUDENT') {
      return this.canAccessTask(user, taskId);
    }
    return false; // Mentors cannot modify
  }

  async canAccessComment(user: User, commentId: string): Promise<boolean> {
    if (!this.commentRepository) return false;
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) return false;
    return this.canAccessTask(user, comment.taskId);
  }

  async canModifyComment(user: User, commentId: string): Promise<boolean> {
    if (user.role !== 'STUDENT') {
      return false; // Mentors cannot modify/delete comments
    }
    if (!this.commentRepository) return false;
    const comment = await this.commentRepository.findById(commentId);
    if (!comment) return false;
    return this.canModifyTask(user, comment.taskId);
  }

  async canAccessSubmission(user: User, submissionId: string): Promise<boolean> {
    if (!this.submissionRepository) return false;
    const submission = await this.submissionRepository.findById(submissionId);
    if (!submission) return false;
    return this.canAccessProject(user, submission.projectId);
  }

  /**
   * Only students who can access the project may create/edit/submit their own submissions.
   * Mentors are read-only for submissions in this domain.
   */
  async canModifySubmission(user: User, submissionId: string): Promise<boolean> {
    if (user.role !== 'STUDENT') return false;
    return this.canAccessSubmission(user, submissionId);
  }

  /**
   * Check whether the session user can create a new submission for the given project.
   */
  async canCreateSubmissionForProject(user: User, projectId: string): Promise<boolean> {
    if (user.role !== 'STUDENT') return false;
    return this.canAccessProject(user, projectId);
  }

  async canAccessReview(user: User, reviewId: string): Promise<boolean> {
    if (!this.reviewRepository) return false;
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) return false;
    return this.canAccessSubmission(user, review.submissionId);
  }

  /**
   * Mentor must be assigned to the team to review submissions.
   */
  async canReviewSubmission(user: User, submissionId: string): Promise<boolean> {
    if (user.role !== 'MENTOR') return false;
    if (!this.submissionRepository) return false;
    const submission = await this.submissionRepository.findById(submissionId);
    if (!submission) return false;
    
    const project = await this.projectRepository.findById(submission.projectId);
    if (!project) return false;
    
    const team = await this.teamRepository.findById(project.teamId);
    if (!team) return false;

    return team.mentorId === user.id;
  }
  
  async canModifyReview(user: User, reviewId: string): Promise<boolean> {
    if (user.role !== 'MENTOR') return false;
    if (!this.reviewRepository) return false;
    const review = await this.reviewRepository.findById(reviewId);
    if (!review) return false;
    
    return this.canReviewSubmission(user, review.submissionId);
  }
}
