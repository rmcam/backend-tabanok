import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { Gamification } from '../../features/gamification/entities/gamification.entity';
import { Achievement } from '../../features/gamification/entities/achievement.entity';


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

        // Sembrar relaciones entre Gamification y Achievements
        for (const gamification of gamifications) {
            // Obtener el registro de gamificación con sus logros existentes
            const existingGamification = await gamificationRepository.findOne({
                where: { id: gamification.id },
                relations: ['achievements'],
            });

            if (!existingGamification) {
                console.warn(`Gamification record with ID ${gamification.id} not found or not fully initialized. Skipping linking achievements.`);
                continue;
            }

            // TODO: Definir las asociaciones específicas entre gamificaciones y logros aquí
            const gamificationAchievements = [
                // Ejemplo de asociación (reemplazar con IDs reales)
                {
                    gamificationId: 'reemplazar-con-id-de-gamificacion-1',
                    achievementIds: ['reemplazar-con-id-logro-a', 'reemplazar-con-id-logro-b'],
                },
                {
                    gamificationId: 'reemplazar-con-id-de-gamificacion-2',
                    achievementIds: ['reemplazar-con-id-logro-c'],
                },
            ];

            for (const ga of gamificationAchievements) {
                const gamification = gamifications.find(g => g.id === ga.gamificationId);

                if (!gamification) {
                    console.warn(`Gamification with ID ${ga.gamificationId} not found. Skipping.`);
                    continue;
                }

                // Obtener el registro de gamificación con sus logros existentes
                const existingGamificationWithAchievements = await gamificationRepository.findOne({
                    where: { id: gamification.id },
                    relations: ['achievements'],
                });

                if (!existingGamificationWithAchievements) {
                    console.warn(`Gamification record with ID ${gamification.id} not found or not fully initialized. Skipping linking achievements.`);
                    continue;
                }

                const achievementsToLink = achievements.filter(a => ga.achievementIds.includes(a.id));

                let linkedCount = 0;
                for (const achievementToLink of achievementsToLink) {
                    // Verificar si la relación ya existe para evitar duplicados
                    if (!existingGamificationWithAchievements.achievements.some(a => a.id === achievementToLink.id)) {
                        existingGamificationWithAchievements.achievements.push(achievementToLink);
                        linkedCount++;
                    } else {
                        console.log(`Relation between Gamification ID ${gamification.id} and Achievement ID ${achievementToLink.id} already exists. Skipping.`);
                    }
                }

                if (linkedCount > 0) {
                    await gamificationRepository.save(existingGamificationWithAchievements);
                    console.log(`Linked ${linkedCount} new achievements to Gamification ID ${gamification.id}.`);
                } else {
                    console.log(`No new achievements linked to Gamification ID ${gamification.id}.`);
                }
            }
        }

        console.log('GamificationAchievementsAchievements seeding finished.');
    }
}
