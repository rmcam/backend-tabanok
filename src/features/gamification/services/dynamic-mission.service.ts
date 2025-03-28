import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gamification } from '../entities/gamification.entity';
import { MissionTemplate } from '../entities/mission-template.entity';
import { Mission, MissionFrequency } from '../entities/mission.entity';
import { StreakService } from './streak.service';

@Injectable()
export class DynamicMissionService {
    constructor(
        @InjectRepository(MissionTemplate)
        private missionTemplateRepository: Repository<MissionTemplate>,
        @InjectRepository(Mission)
        private missionRepository: Repository<Mission>,
        @InjectRepository(Gamification)
        private gamificationRepository: Repository<Gamification>,
        private streakService: StreakService
    ) { }

    async generateDynamicMissions(userId: string): Promise<Mission[]> {
        const gamification = await this.gamificationRepository.findOne({
            where: { userId },
            relations: ['achievements']
        });

        const streak = await this.streakService.getStreakInfo(userId);
        const templates = await this.getEligibleTemplates(gamification, streak);
        const missions: Mission[] = [];

        for (const template of templates) {
            const mission = await this.createDynamicMission(template, gamification);
            missions.push(mission);
        }

        return missions;
    }

    private async getEligibleTemplates(
        gamification: Gamification,
        streak: { currentStreak: number }
    ): Promise<MissionTemplate[]> {
        const templates = await this.missionTemplateRepository.find();

        return templates.filter(template => {
            // Verificar nivel
            if (gamification.level < template.minLevel ||
                (template.maxLevel > 0 && gamification.level > template.maxLevel)) {
                return false;
            }

            // Verificar requisitos
            if (template.requirements) {
                // Verificar racha mínima
                if (template.requirements.minimumStreak &&
                    streak.currentStreak < template.requirements.minimumStreak) {
                    return false;
                }

                // Verificar logros específicos
                if (template.requirements.specificAchievements) {
                    const hasAllAchievements = template.requirements.specificAchievements.every(
                        achievementId => gamification.achievements.some(a => a.id === achievementId)
                    );
                    if (!hasAllAchievements) return false;
                }

                // Verificar misiones previas
                if (template.requirements.previousMissions) {
                    // Aquí podrías agregar la lógica para verificar misiones previas completadas
                    // Por ahora lo dejamos pendiente para una implementación futura
                }
            }

            return true;
        });
    }

    private async createDynamicMission(
        template: MissionTemplate,
        gamification: Gamification
    ): Promise<Mission> {
        // Calcular dificultad basada en el nivel
        const scaling = this.calculateScaling(template, gamification.level);

        // Calcular fechas
        const { startDate, endDate } = this.calculateMissionDates(template.frequency);

        // Crear la misión
        const mission = this.missionRepository.create({
            title: template.title,
            description: template.description,
            type: template.type,
            frequency: template.frequency,
            targetValue: Math.round(template.baseTargetValue * scaling.targetMultiplier),
            rewardPoints: Math.round(template.baseRewardPoints * scaling.rewardMultiplier),
            startDate,
            endDate,
            rewardBadge: template.rewardBadge,
            completedBy: [],
            bonusConditions: template.bonusConditions
        });

        return this.missionRepository.save(mission);
    }

    private calculateScaling(template: MissionTemplate, userLevel: number): {
        targetMultiplier: number;
        rewardMultiplier: number;
    } {
        // Encontrar el escalado apropiado basado en el nivel
        const scaling = template.difficultyScaling.find((scale, index) => {
            const nextScale = template.difficultyScaling[index + 1];
            return !nextScale || userLevel < nextScale.targetMultiplier;
        });

        return scaling || {
            targetMultiplier: 1,
            rewardMultiplier: 1
        };
    }

    private calculateMissionDates(frequency: MissionFrequency): {
        startDate: Date;
        endDate: Date;
    } {
        const now = new Date();
        const startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(startDate);

        switch (frequency) {
            case MissionFrequency.DAILY:
                endDate.setDate(startDate.getDate() + 1);
                break;
            case MissionFrequency.WEEKLY:
                endDate.setDate(startDate.getDate() + 7);
                break;
            case MissionFrequency.MONTHLY:
                endDate.setMonth(startDate.getMonth() + 1);
                break;
        }

        return { startDate, endDate };
    }

    async checkBonusConditions(
        userId: string,
        mission: Mission,
        progress: number
    ): Promise<number> {
        if (!mission.bonusConditions) return 0;

        let totalBonus = 0;
        const gamification = await this.gamificationRepository.findOne({
            where: { userId }
        });

        for (const condition of mission.bonusConditions) {
            switch (condition.condition) {
                case 'perfect_score':
                    if (progress === 100) {
                        totalBonus += mission.rewardPoints * (condition.multiplier - 1);
                    }
                    break;
                case 'streak_active':
                    const streak = await this.streakService.getStreakInfo(userId);
                    if (streak.currentStreak > 0) {
                        totalBonus += mission.rewardPoints * (condition.multiplier - 1);
                    }
                    break;
                // Agregar más condiciones según sea necesario
            }
        }

        return Math.round(totalBonus);
    }
} 