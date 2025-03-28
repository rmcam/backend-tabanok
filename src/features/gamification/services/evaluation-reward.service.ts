import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gamification } from '../entities/gamification.entity';
import { MissionType } from '../entities/mission.entity';
import { MissionService } from './mission.service';

@Injectable()
export class EvaluationRewardService {
    constructor(
        @InjectRepository(Gamification)
        private gamificationRepository: Repository<Gamification>,
        private missionService: MissionService
    ) { }

    async handleEvaluationCompletion(
        userId: string,
        score: number,
        totalQuestions: number
    ): Promise<void> {
        const gamification = await this.gamificationRepository.findOne({
            where: { userId }
        });

        if (!gamification) {
            return;
        }

        // Calcular porcentaje de acierto
        const percentage = (score / totalQuestions) * 100;

        // Actualizar estadísticas
        gamification.stats.exercisesCompleted++;
        if (percentage === 100) {
            gamification.stats.perfectScores++;
        }

        // Calcular experiencia ganada
        const baseExperience = 50; // Experiencia base por completar una evaluación
        const bonusExperience = Math.floor(percentage / 10) * 5; // Bonus por porcentaje de acierto
        const totalExperience = baseExperience + bonusExperience;

        // Actualizar experiencia y nivel
        await this.updateExperienceAndLevel(gamification, totalExperience);

        // Actualizar progreso de misiones
        await this.missionService.updateMissionProgress(
            userId,
            MissionType.PRACTICE_EXERCISES,
            gamification.stats.exercisesCompleted
        );

        if (percentage === 100) {
            await this.missionService.updateMissionProgress(
                userId,
                MissionType.PRACTICE_EXERCISES,
                gamification.stats.perfectScores
            );
        }

        // Registrar actividad
        gamification.recentActivities.unshift({
            type: 'evaluation_completed',
            description: `Completó una evaluación con ${score}/${totalQuestions} (${percentage}%)`,
            pointsEarned: totalExperience,
            timestamp: new Date()
        });

        await this.gamificationRepository.save(gamification);
    }

    private async updateExperienceAndLevel(
        gamification: Gamification,
        experienceGained: number
    ): Promise<void> {
        gamification.experience += experienceGained;
        gamification.points += experienceGained;

        // Verificar si el usuario sube de nivel
        while (gamification.experience >= gamification.nextLevelExperience) {
            gamification.level++;
            gamification.experience -= gamification.nextLevelExperience;
            gamification.nextLevelExperience = Math.floor(gamification.nextLevelExperience * 1.5);

            // Registrar subida de nivel
            gamification.recentActivities.unshift({
                type: 'level_up',
                description: `¡Subió al nivel ${gamification.level}!`,
                pointsEarned: 0,
                timestamp: new Date()
            });
        }
    }
} 