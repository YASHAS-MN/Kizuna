import { Router } from 'express';
import { InMemoryTeamRepository } from '../repositories/team.repository.js';
import { TeamService } from '../services/team.service.js';
import { TeamController } from '../controllers/team.controller.js';

const router = Router();

const teamRepository = new InMemoryTeamRepository();
const teamService = new TeamService(teamRepository);
const teamController = new TeamController(teamService);

router.get('/teams', teamController.getAllTeams);

export default router;
