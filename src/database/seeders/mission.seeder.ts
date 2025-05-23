import { v4 as uuidv4 } from 'uuid';
import { DataSource } from "typeorm";
import { MissionFrequency, MissionTemplate } from "../../features/gamification/entities/mission-template.entity"; // Import MissionTemplate and MissionFrequency
import {
  Mission,
  MissionType,
} from "../../features/gamification/entities/mission.entity";
import { DataSourceAwareSeed } from './data-source-aware-seed'; 
import { User } from "../../auth/entities/user.entity"; // Import User

export class MissionSeeder extends DataSourceAwareSeed {
  public constructor(dataSource: DataSource) {
    super(dataSource);
  }

  public async run(): Promise<void> {
    const missionRepository = this.dataSource.getRepository(Mission);
    const missionTemplateRepository = this.dataSource.getRepository(MissionTemplate); // Get MissionTemplate repository
    const userRepository = this.dataSource.getRepository(User); // Get User repository

    const missionTemplates = await missionTemplateRepository.find(); // Fetch all mission templates
    const users = await userRepository.find(); // Fetch all users

    if (missionTemplates.length === 0) {
      console.log('No mission templates found. Skipping MissionSeeder.');
      return;
    }

    if (users.length === 0) {
        console.log('No users found. Skipping MissionSeeder.');
        return;
    }

    const missionsToSeed = [];
    const now = new Date();

    // Create mission instances for users based on templates
    for (const user of users) {
        // Select a random subset of mission templates for each user
        const shuffledTemplates = missionTemplates.sort(() => 0.5 - Math.random());
        const numberOfTemplatesToAssign = Math.floor(Math.random() * Math.min(shuffledTemplates.length, user.roles[0] === 'admin' ? 10 : user.roles[0] === 'teacher' ? 7 : 5)) + 1; // Assign more templates to active roles

        for (let i = 0; i < numberOfTemplatesToAssign; i++) {
            const template = shuffledTemplates[i] as any; // Explicitly cast to any

            // Determine start and end dates based on frequency
            let startDate = new Date(now);
            let endDate = new Date(now);

            switch (template.frequency) {
                case MissionFrequency.DIARIA:
                    endDate.setDate(now.getDate() + 1); // Ends tomorrow
                    break;
                case MissionFrequency.SEMANAL:
                    endDate.setDate(now.getDate() + 7); // Ends in a week
                    break;
                case MissionFrequency.MENSUAL:
                    endDate.setMonth(now.getMonth() + 1); // Ends in a month
                    break;
                case MissionFrequency.UNICA:
                    endDate.setFullYear(now.getFullYear() + 1); // Ends in a year (for unique missions)
                    break;
            }

            // Adjust dates for limited missions
            if (template.isLimited && template.startDate && template.endDate) {
                startDate = new Date(template.startDate); // Ensure dates are Date objects
                endDate = new Date(template.endDate); // Ensure dates are Date objects
            }


            // Simulate mission completion for some users
            const isCompleted = Math.random() > (user.roles[0] === 'admin' ? 0.1 : user.roles[0] === 'teacher' ? 0.3 : 0.6); // Higher completion chance for active roles
            const completedBy = isCompleted ? [{ userId: user.id, progress: template.baseTargetValue, completedAt: new Date(endDate.getTime() - Math.random() * 24 * 60 * 60 * 1000) }] : []; // Include progress and completedAt

            // Create a plain object instead of using repository.create()
            const mission = {
                id: uuidv4(),
                title: template.title,
                description: template.description,
                type: template.type,
                criteria: template.criteria,
                frequency: template.frequency,
                targetValue: template.baseTargetValue, // Use baseTargetValue from template
                rewardPoints: template.baseRewardPoints, // Use baseRewardPoints from template
                rewardBadge: template.rewardBadge, // Use rewardBadge from template
                rewardAchievement: template.rewardAchievement, // Use rewardAchievement from template
                startDate: startDate,
                endDate: endDate,
                completedBy: completedBy, // Assign completedBy array with correct structure
                missionTemplate: template, // Associate with the mission template
                missionTemplateId: template.id, // Associate with mission template ID
                isActive: template.isActive,
                minLevel: template.minLevel,
                maxLevel: template.maxLevel,
                conditions: template.conditions,
                category: template.category,
                tags: template.tags,
                isSecret: template.isSecret,
                limitedQuantity: template.limitedQuantity,
                isLimited: template.isLimited,
                bonusConditions: template.bonusConditions,
                requirements: template.requirements,
                difficultyScaling: template.difficultyScaling,
            };
            missionsToSeed.push(mission);
        }
    }

    // Save all mission instances in a single call
    await missionRepository.save(missionsToSeed);
    console.log(`Seeded ${missionsToSeed.length} mission instances.`);
    console.log('Mission seeder finished.');
  }
}
