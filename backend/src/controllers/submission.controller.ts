import { Response, NextFunction } from 'express';
import { SubmissionService } from '../services/submission.service.js';
import { AuthorizationService } from '../services/authorization.service.js';
import { ActivityService } from '../services/activity.service.js';
import { AuthenticatedRequest } from '../middlewares/auth.middleware.js';
import { SubmissionStatus } from '../models/submission.js';

export class SubmissionController {
  constructor(
    private submissionService: SubmissionService,
    private authService: AuthorizationService,
    private activityService: ActivityService
  ) {}

  getSubmissionsForProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { projectId } = req.query;
      if (!projectId || typeof projectId !== 'string') {
        return res.status(400).json({ status: 'error', message: 'projectId query parameter is required' });
      }

      const user = req.user!;
      if (!(await this.authService.canAccessProject(user, projectId))) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
      }

      const submissions = await this.submissionService.getSubmissionsForProject(projectId);
      res.status(200).json(submissions);
    } catch (error) {
      next(error);
    }
  };

  getSubmissionById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = req.user!;

      if (!(await this.authService.canAccessSubmission(user, id))) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
      }

      const submission = await this.submissionService.getSubmissionById(id);
      if (!submission) {
        return res.status(404).json({ status: 'error', message: 'Submission not found' });
      }

      res.status(200).json(submission);
    } catch (error) {
      next(error);
    }
  };

  createSubmission = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const user = req.user!;
      const { projectId, title, description } = req.body;

      if (!projectId || !title || !description) {
        return res.status(400).json({ status: 'error', message: 'projectId, title, and description are required' });
      }

      const cleanProjectId = String(projectId).trim();
      const cleanTitle = String(title).trim();
      const cleanDesc = String(description).trim();

      if (!cleanTitle) return res.status(400).json({ status: 'error', message: 'Submission title is required' });
      if (!cleanDesc) return res.status(400).json({ status: 'error', message: 'Submission description is required' });

      if (!(await this.authService.canCreateSubmissionForProject(user, cleanProjectId))) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
      }

      const now = new Date().toISOString();
      const newSubmission = {
        id: `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        projectId: cleanProjectId,
        title: cleanTitle,
        description: cleanDesc,
        submittedBy: user.id,
        submittedByName: user.name,
        status: 'DRAFT' as SubmissionStatus,
        version: 1,
        createdAt: now,
        updatedAt: now
      };

      const created = await this.submissionService.createSubmission(newSubmission);

      // Emit activity
      await this.activityService.createActivity({
        id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        projectId: created.projectId,
        actorId: user.id,
        actorName: user.name,
        type: 'SUBMISSION_CREATED',
        message: `created submission draft "${created.title}"`,
        submissionId: created.id,
        createdAt: now,
        metadata: { submissionId: created.id }
      });

      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  };

  updateSubmission = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = req.user!;
      const { title, description } = req.body;

      if (!(await this.authService.canModifySubmission(user, id))) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
      }

      const existing = await this.submissionService.getSubmissionById(id);
      if (!existing) {
        return res.status(404).json({ status: 'error', message: 'Submission not found' });
      }

      if (existing.status !== 'DRAFT') {
        return res.status(400).json({ status: 'error', message: 'Only draft submissions can be edited' });
      }

      const cleanTitle = title?.trim();
      const cleanDesc = description?.trim();
      if (!cleanTitle) return res.status(400).json({ status: 'error', message: 'Submission title is required' });
      if (!cleanDesc) return res.status(400).json({ status: 'error', message: 'Submission description is required' });

      const now = new Date().toISOString();
      const updated = await this.submissionService.updateSubmission(id, { title: cleanTitle, description: cleanDesc, updatedAt: now });

      // Emit activity
      await this.activityService.createActivity({
        id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        projectId: existing.projectId,
        actorId: user.id,
        actorName: user.name,
        type: 'SUBMISSION_UPDATED',
        message: `updated submission draft "${cleanTitle}"`,
        submissionId: id,
        createdAt: now,
        metadata: { submissionId: id }
      });

      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  };

  submitSubmission = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = req.user!;

      if (!(await this.authService.canModifySubmission(user, id))) {
        return res.status(403).json({ status: 'error', message: 'Forbidden' });
      }

      const existing = await this.submissionService.getSubmissionById(id);
      if (!existing) {
        return res.status(404).json({ status: 'error', message: 'Submission not found' });
      }

      if (existing.status !== 'DRAFT') {
        return res.status(400).json({ status: 'error', message: 'Only draft submissions can be submitted' });
      }

      const submitted = await this.submissionService.submitSubmission(id);

      // Emit activity
      const now = new Date().toISOString();
      await this.activityService.createActivity({
        id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        projectId: existing.projectId,
        actorId: user.id,
        actorName: user.name,
        type: 'SUBMISSION_SUBMITTED',
        message: `submitted deliverable "${existing.title}" (v${existing.version})`,
        submissionId: id,
        createdAt: now,
        metadata: { submissionId: id, version: String(existing.version) }
      });

      res.status(200).json(submitted);
    } catch (error) {
      next(error);
    }
  };
}

