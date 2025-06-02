import { DataSource } from "typeorm";
import { v4 as uuidv4 } from 'uuid';
import { User } from "../../auth/entities/user.entity";
import {
  Activity,
  ActivityType,
  DifficultyLevel,
} from "../../features/activity/entities/activity.entity";
import { DataSourceAwareSeed } from "./data-source-aware-seed";
import * as fs from 'fs';
import * as path from 'path';

export class ActivitySeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const activityRepository = this.dataSource.getRepository(Activity);
    const userRepository = this.dataSource.getRepository(User);
    const activitiesJsonPath = path.resolve(__dirname, '../files/json/activities.json');

    try {
      const activitiesJsonContent = JSON.parse(fs.readFileSync(activitiesJsonPath, 'utf-8'));

      for (const activityData of activitiesJsonContent) {
        const existingActivity = await activityRepository.findOne({
          where: { title: activityData.title },
        });

        if (!existingActivity) {
          const creator = await userRepository.findOne({ where: { email: activityData.creatorEmail } });

          if (!creator) {
            console.warn(`Creator with email "${activityData.creatorEmail}" not found for activity "${activityData.title}". Skipping.`);
            continue;
          }

          const newActivity = activityRepository.create({
            id: uuidv4(),
            title: activityData.title,
            description: activityData.description,
            type: activityData.type as ActivityType,
            difficulty: activityData.difficulty as DifficultyLevel,
            content: activityData.content,
            points: activityData.points,
            user: creator,
            userId: creator.id,
          });
          await activityRepository.save(newActivity);
          console.log(`Activity "${activityData.title}" seeded.`);
        } else {
          console.log(`Activity "${activityData.title}" already exists. Skipping.`);
        }
      }
      console.log('ActivitySeeder finished.');
    } catch (error) {
      console.error('Error seeding activities:', error);
    }
  }
}
