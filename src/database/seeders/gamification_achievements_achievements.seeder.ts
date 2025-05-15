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
        const achievements = await achievementRepository.find();

        if (gamifications.length === 0 || achievements.length === 0) {
            console.warn('No gamifications or achievements found. Skipping GamificationAchievementsAchievementsSeeder.');
            return;
        }

        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            // Clear existing relations to avoid duplicates on re-seeding
            await queryRunner.query('TRUNCATE TABLE "gamification_achievements_achievements" CASCADE;');
            console.log('Truncated table: gamification_achievements_achievements');

            for (const gamification of gamifications) {
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

                    if (randomAchievement && !linkedAchievementIds.includes(randomAchievement.id)) {
                        await queryRunner.query(
                            `INSERT INTO "gamification_achievements_achievements" ("gamificationId", "achievementsId") VALUES ($1, $2)`,
                            [gamification.id, randomAchievement.id]
                        );
                        linkedAchievementIds.push(randomAchievement.id);
                        console.log(`Linked Gamification ID ${gamification.id} with Achievement ID ${randomAchievement.id}`);
                    } else if (attempts >= 10) {
                        console.warn(`Could not find a unique achievement to link to Gamification ID ${gamification.id} after 10 attempts.`);
                    }
                }
            }

            await queryRunner.commitTransaction();
            console.log('GamificationAchievementsAchievements seeding complete.');

        } catch (error) {
            await queryRunner.rollbackTransaction();
            console.error('GamificationAchievementsAchievements seeding failed. Transaction rolled back.', error);
            throw error;
        } finally {
            await queryRunner.release();
        }
    }
}