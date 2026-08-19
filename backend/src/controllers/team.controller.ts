import { Request, Response, NextFunction } from 'express';
import { TeamService } from '../services/team.service.js';

export class TeamController {
  constructor(private teamService: TeamService) {}

  getAllTeams = async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const teams = await this.teamService.getAllTeams();
      res.status(200).json(teams);
    } catch (error) {
      next(error);
    }
  };
}
