import { Comment } from '../models/comment.js';

export interface CommentRepository {
  findByTaskId(taskId: string): Promise<Comment[]>;
  findById(id: string): Promise<Comment | null>;
  create(comment: Comment): Promise<Comment>;
  delete(id: string): Promise<boolean>;
}
