import { InMemoryUserRepository } from './user.repository.js';
import { InMemoryTeamRepository } from './team.repository.js';
import { InMemoryProjectRepository } from './project.repository.js';
import { InMemorySessionRepository } from './session.repository.js';

export const userRepository = new InMemoryUserRepository();
export const teamRepository = new InMemoryTeamRepository();
export const projectRepository = new InMemoryProjectRepository();
export const sessionRepository = new InMemorySessionRepository();
