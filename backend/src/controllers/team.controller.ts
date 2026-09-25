import { Request, Response, NextFunction } from 'express';
import { TeamService } from '../services/team.service.js';
import { AuthorizationService } from '../services/authorization.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';

export class TeamController {
  constructor(
    private teamService: TeamService,
    private authService: AuthorizationService
  ) {}

  getAllTeams = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      const teams = await this.teamService.getAllTeamsForUser(user);
      res.status(200).json(teams);
    } catch (error) {
      next(error);
    }
  };

  getTeamById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = req.user!;

      if (!(await this.authService.canAccessTeam(user, id))) {
        return res.status(403).json({
          status: 'error',
          message: 'Forbidden: You do not have access to this team'
        });
      }

      const team = await this.teamService.getTeamById(id);
      if (!team) {
        return res.status(404).json({
          status: 'error',
          message: `Team with ID '${id}' not found`
        });
      }

      // Also get team members to return a complete team object like the frontend expects
      const members = await this.teamService.getTeamMembers(id);
      
      res.status(200).json({
        ...team,
        members
      });
    } catch (error) {
      next(error);
    }
  };
}
