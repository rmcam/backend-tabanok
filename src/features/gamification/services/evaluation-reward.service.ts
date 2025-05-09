import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gamification } from '../entities/gamification.entity';
import { MissionType } from '../entities/mission.entity';
import { MissionService } from './mission.service';
import { GamificationService } from './gamification.service';

@Injectable()
export class EvaluationRewardService {
    constructor(
        @InjectRepository(Gamification)
        private gamificationRepository: Repository<Gamification>,
        private missionService: MissionService,
        private gamificationService: GamificationService
    ) { }

    async handleEvaluationCompletion(
        userId: string,
        score: number,
        totalQuestions: number
    ): Promise<void> {
        let gamification = await this.gamificationRepository.findOne({
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

        // Actualizar experiencia, puntos y nivel usando GamificationService
        await this.gamificationService.awardPoints(
            userId,
            totalExperience,
            'evaluation_completed', // Tipo de actividad
            `Completó una evaluación con ${score}/${totalQuestions} (${percentage}%)` // Descripción
        );

        gamification = await this.gamificationRepository.findOne({
            where: { userId }
        });

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

        // La actividad ya se registra en GamificationService.awardPoints
        // gamification.recentActivities.unshift({
        //     type: 'evaluation_completed',
        //     description: `Completó una evaluación con ${score}/${totalQuestions} (${percentage}%)`,
        //     pointsEarned: totalExperience,
        //     timestamp: new Date()
        // });

        // await this.gamificationRepository.save(gamification); // No es necesario guardar aquí, GamificationService lo hace
    }
}
