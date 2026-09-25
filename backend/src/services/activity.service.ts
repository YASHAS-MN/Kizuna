import { ActivityRepository } from '../repositories/activity.repository.js';
import { ActivityEvent } from '../models/activity.js';

export class ActivityService {
  constructor(private activityRepository: ActivityRepository) {}

  async getProjectActivity(projectId: string): Promise<ActivityEvent[]> {
    return this.activityRepository.findByProjectId(projectId);
  }

  async createActivity(event: ActivityEvent): Promise<ActivityEvent> {
    return this.activityRepository.create(event);
  }
}
