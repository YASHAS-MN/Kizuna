import { Router } from 'express';
import { teamRepository } from '../repositories/index.js';
import { TeamService } from '../services/team.service.js';
import { TeamController } from '../controllers/team.controller.js';

const router = Router();

const teamService = new TeamService(teamRepository);
const teamController = new TeamController(teamService);

router.get('/teams', teamController.getAllTeams);

export default router;
