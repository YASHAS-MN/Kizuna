import { CommentRepository } from '../repositories/comment.repository.js';
import { Comment } from '../models/comment.js';

export class CommentService {
  constructor(private commentRepository: CommentRepository) {}

  async getCommentsForTask(taskId: string): Promise<Comment[]> {
    return this.commentRepository.findByTaskId(taskId);
  }

  async getCommentById(id: string): Promise<Comment | null> {
    return this.commentRepository.findById(id);
  }

  async createComment(comment: Comment): Promise<Comment> {
    return this.commentRepository.create(comment);
  }

  async deleteComment(id: string): Promise<boolean> {
    return this.commentRepository.delete(id);
  }
}
