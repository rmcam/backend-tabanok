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
                startDate: new Date(), // Set a fixed start date
                endDate: null, // No end date by default
                completedBy: [], // No completedBy by default
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
