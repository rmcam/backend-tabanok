import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { Gamification } from '../../features/gamification/entities/gamification.entity';
import { Achievement } from '../../features/gamification/entities/achievement.entity';
import * as fs from 'fs';
import * as path from 'path';

export class GamificationAchievementsAchievementsSeeder extends DataSourceAwareSeed {
    constructor(dataSource: DataSource) {
        super(dataSource);
    }

    async run(): Promise<void> {
        const gamificationRepository = this.dataSource.getRepository(Gamification);
        const achievementRepository = this.dataSource.getRepository(Achievement);
        const relationsJsonPath = path.resolve(__dirname, '../files/json/gamification_achievements_relations.json');

        try {
            const relationsJsonContent = JSON.parse(fs.readFileSync(relationsJsonPath, 'utf-8'));

            for (const relationData of relationsJsonContent) {
                const gamification = await gamificationRepository.findOne({
                    where: { id: relationData.gamificationId },
                    relations: ['achievements'],
                });

                if (!gamification) {
                    console.warn(`Gamification with ID ${relationData.gamificationId} not found. Skipping.`);
                    continue;
                }

                for (const achievementId of relationData.achievementIds) {
                    const achievement = await achievementRepository.findOne({
                        where: { id: achievementId },
                    });

                    if (!achievement) {
                        console.warn(`Achievement with ID ${achievementId} not found. Skipping.`);
                        continue;
                    }

                    const relationExists = gamification.achievements.some(a => a.id === achievement.id);

                    if (!relationExists) {
                        gamification.achievements.push(achievement);
                        console.log(`Linked Gamification ID ${gamification.id} with Achievement ID ${achievement.id}`);
                    } else {
                        console.log(`Relation between Gamification ID ${gamification.id} and Achievement ID ${achievement.id} already exists. Skipping.`);
                    }
                }
                await gamificationRepository.save(gamification);
            }
            console.log('GamificationAchievementsAchievements seeding complete.');
        } catch (error) {
            console.error('Error seeding gamification achievements relations:', error);
        }
    }
}
