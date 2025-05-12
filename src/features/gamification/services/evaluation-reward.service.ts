import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm'; // Import DataSource
import { Gamification } from '../entities/gamification.entity';
import { Mission, MissionType } from '../entities/mission.entity'; // Import Mission entity
import { MissionService } from './mission.service'; // Keep MissionService for other methods if needed
import { GamificationService } from './gamification.service'; // Keep GamificationService for other methods if needed

@Injectable()
export class EvaluationRewardService {
    constructor(
        @InjectRepository(Gamification)
        private gamificationRepository: Repository<Gamification>,
        @InjectRepository(Mission) // Inject Mission repository
        private missionRepository: Repository<Mission>,
        private dataSource: DataSource, // Inject DataSource
        private missionService: MissionService, // Keep MissionService for other methods if needed
        private gamificationService: GamificationService // Keep GamificationService for other methods if needed
    ) { }

    async handleEvaluationCompletion(
        userId: string,
        score: number,
        totalQuestions: number
    ): Promise<void> {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const gamification = await queryRunner.manager.findOne(Gamification, {
                where: { userId }
            });

            if (!gamification) {
                await queryRunner.commitTransaction(); // Commit empty transaction
                return;
            }

            // Calcular porcentaje de acierto
            const percentage = (score / totalQuestions) * 100;

            // Actualizar estadísticas directamente dentro de la transacción
            gamification.stats.exercisesCompleted++;
            if (percentage === 100) {
                gamification.stats.perfectScores++;
            }

            // Calcular experiencia ganada
            const baseExperience = 50; // Experiencia base por completar una evaluación
            const bonusExperience = Math.floor(percentage / 10) * 5; // Bonus por porcentaje de acierto
            const totalExperience = baseExperience + bonusExperience;

            // Actualizar experiencia, puntos y nivel directamente dentro de la transacción
            gamification.points += totalExperience;
            gamification.experience += totalExperience; // Assuming experience also increases by totalExperience

            // Check for level up (simplified logic, actual logic might be in GamificationService)
            // If level up logic is complex, consider moving it here or adapting GamificationService
            // For now, assuming simple point/experience addition is sufficient within the transaction.

            // Registrar actividad directamente dentro de la transacción
            gamification.recentActivities.unshift({
                type: 'evaluation_completed',
                description: `Completó una evaluación con ${score}/${totalQuestions} (${percentage}%)`,
                pointsEarned: totalExperience,
                timestamp: new Date()
            });

            // Guardar cambios en gamification
            await queryRunner.manager.save(gamification);

            // Actualizar progreso de misiones directamente dentro de la transacción
            const missionsToUpdate = await queryRunner.manager.find(Mission, {
                where: [
                    { type: MissionType.PRACTICE_EXERCISES, completedBy: [] }, // Assuming missions are completed by adding userId to completedBy array
                    // Add other mission types related to evaluations if needed
                ]
            });

            for (const mission of missionsToUpdate) {
                 // Check if the user has already completed this mission
                if (mission.completedBy.some(completion => completion.userId === userId)) {
                    continue;
                }

                let progressUpdated = false;

                // Update progress based on mission type and user stats
                if (mission.type === MissionType.PRACTICE_EXERCISES) {
                    // Assuming targetValue for PRACTICE_EXERCISES missions is based on exercisesCompleted
                    if (gamification.stats.exercisesCompleted >= mission.targetValue) {
                        mission.completedBy.push({
                            userId: userId,
                            progress: gamification.stats.exercisesCompleted, // Use exercisesCompleted as progress
                            completedAt: new Date()
                        });
                        progressUpdated = true;
                    }
                }
                // Add logic for other mission types related to evaluations if needed

                if (progressUpdated) {
                    // Award mission points directly within the transaction
                    gamification.points += mission.rewardPoints;
                    gamification.experience += mission.rewardPoints; // Assuming experience also increases

                    // Register mission completion activity
                    gamification.recentActivities.unshift({
                        type: 'mission_completed',
                        description: `Misión completada: ${mission.title}`,
                        pointsEarned: mission.rewardPoints,
                        timestamp: new Date()
                    });

                    // Save the updated mission and gamification
                    await queryRunner.manager.save(mission);
                    await queryRunner.manager.save(gamification); // Save gamification changes again after mission reward
                }
            }


            await queryRunner.commitTransaction();

        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }
}
