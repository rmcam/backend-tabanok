import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { Gamification } from '../../features/gamification/entities/gamification.entity';
import { Achievement } from '../../features/gamification/entities/achievement.entity';
import { randomInt } from 'crypto';

export class GamificationAchievementsAchievementsSeeder extends DataSourceAwareSeed {
    constructor(dataSource: DataSource) {
        super(dataSource);
    }

    async run(): Promise<void> {
        console.log('Running GamificationAchievementsAchievementsSeeder...');
        const gamificationRepository = this.dataSource.getRepository(Gamification);
        const achievementRepository = this.dataSource.getRepository(Achievement);

        const gamifications = await gamificationRepository.find();
        const validGamifications = gamifications.filter(g => g.id !== null && g.id !== undefined);
        const achievements = await achievementRepository.find();

        if (validGamifications.length === 0 || achievements.length === 0) {
            console.warn('No valid gamifications or achievements found. Skipping GamificationAchievementsAchievementsSeeder.');
            return;
        }

        // Define an interface for the relations to seed
        interface GamificationAchievementRelation {
            gamificationId: string;
            achievementsId: string;
        }

        const relationsToSeed: GamificationAchievementRelation[] = [];

        for (const gamification of validGamifications) {
            // Link each gamification to a random number of achievements (e.g., 1 to 3)
            const numberOfAchievementsToLink = randomInt(1, 4); // 1 to 3 inclusive
            const linkedAchievementIds: string[] = [];

            for (let i = 0; i < numberOfAchievementsToLink; i++) {
                // Select a random achievement that hasn't been linked to this gamification yet
                let randomAchievement: Achievement | undefined;
                let attempts = 0;
                do {
                    const randomIndex = randomInt(0, achievements.length);
                    randomAchievement = achievements[randomIndex];
                    attempts++;
                } while (linkedAchievementIds.includes(randomAchievement.id) && attempts < 10); // Avoid infinite loop

                if (randomAchievement && randomAchievement.id && !linkedAchievementIds.includes(randomAchievement.id)) {
                    relationsToSeed.push({
                        gamificationId: gamification.id,
                        achievementsId: randomAchievement.id,
                    });
                    linkedAchievementIds.push(randomAchievement.id);
                } else if (attempts >= 10) {
                    console.warn(`Could not find a unique achievement to link to Gamification ID ${gamification.id} after 10 attempts.`);
                }
            }
        }

        if (relationsToSeed.length > 0) {
            console.log(`Seeding ${relationsToSeed.length} GamificationAchievementsAchievements relations...`);

            // Get the repository for the join table
            for (const relation of relationsToSeed) {
                // Load the Gamification entity
                const gamification = await gamificationRepository.findOne({
                    where: { id: relation.gamificationId },
                    relations: ['achievements'], // Load existing achievements
                });

                // Load the Achievement entity
                const achievement = await achievementRepository.findOne({
                    where: { id: relation.achievementsId },
                });

                if (gamification && achievement) {
                    // Add the achievement to the gamification entity
                    if (!gamification.achievements) {
                        gamification.achievements = [];
                    }
                    gamification.achievements.push(achievement);

                    // Save the updated Gamification entity
                    await gamificationRepository.save(gamification);
                } else {
                    console.log(`Gamification or Achievement not found for relation: ${JSON.stringify(relation)}`);
                }
            }

            console.log('GamificationAchievementsAchievements seeding complete.');
        } else {
            console.log('No GamificationAchievementsAchievements relations to seed.');
        }
    }
}