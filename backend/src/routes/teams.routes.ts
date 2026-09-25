import { Router } from 'express';
import { teamRepository, projectRepository } from '../repositories/index.js';
import { TeamService } from '../services/team.service.js';
import { TeamController } from '../controllers/team.controller.js';
import { AuthorizationService } from '../services/authorization.service.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

const teamService = new TeamService(teamRepository);
const authService = new AuthorizationService(teamRepository, projectRepository);
const teamController = new TeamController(teamService, authService);

router.get('/teams', requireAuth, teamController.getAllTeams);
router.get('/teams/:id', requireAuth, teamController.getTeamById);
router.post('/teams', requireAuth, teamController.createTeam);
router.post('/teams/:id/members', requireAuth, teamController.addMember);
router.put('/teams/:id/members/:userId', requireAuth, teamController.updateMemberRole);
router.delete('/teams/:id/members/:userId', requireAuth, teamController.removeMember);

export default router;
