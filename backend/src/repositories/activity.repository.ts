import { ActivityEvent } from '../models/activity.js';

export interface ActivityRepository {
  findByProjectId(projectId: string): Promise<ActivityEvent[]>;
  create(event: ActivityEvent): Promise<ActivityEvent>;
}
