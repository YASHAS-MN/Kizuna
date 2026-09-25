import { SQLiteUserRepository } from './sqlite-user.repository.js';
import { SQLiteTeamRepository } from './sqlite-team.repository.js';
import { SQLiteProjectRepository } from './sqlite-project.repository.js';
import { SQLiteTaskRepository } from './sqlite-task.repository.js';
import { SQLiteCommentRepository } from './sqlite-comment.repository.js';
import { InMemorySessionRepository } from './session.repository.js';

export const userRepository = new SQLiteUserRepository();
export const teamRepository = new SQLiteTeamRepository();
export const projectRepository = new SQLiteProjectRepository();
export const taskRepository = new SQLiteTaskRepository();
export const commentRepository = new SQLiteCommentRepository();
export const sessionRepository = new InMemorySessionRepository(); // Remains in-memory as allowed by requirements
