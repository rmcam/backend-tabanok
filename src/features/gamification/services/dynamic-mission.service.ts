import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gamification } from '../entities/gamification.entity';
import { MissionTemplate, MissionFrequency as MissionTemplateFrequency } from '../entities/mission-template.entity';
import { Mission, MissionFrequency } from '../entities/mission.entity'; // Corrected import
import { StreakService } from './streak.service';

export function mapTemplateFrequencyToMissionFrequency(freq: MissionTemplateFrequency): MissionFrequency {
  switch (freq) {
    case MissionTemplateFrequency.DIARIA:
      return MissionFrequency.DIARIA; // Corrected mapping
    case MissionTemplateFrequency.SEMANAL:
      return MissionFrequency.SEMANAL; // Corrected mapping
    case MissionTemplateFrequency.MENSUAL:
      return MissionFrequency.MENSUAL; // Corrected mapping
    default:
      // Should not happen if template frequency is one of the defined enums,
      // but as a fallback, return a default or throw an error.
      // Returning DIARIA as a fallback for now, consistent with entity enum.
      return MissionFrequency.DIARIA;
  }
}

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
            // Verificar si la plantilla está activa
            if (!template.isActive) {
                return false;
            }

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
        const { startDate, endDate } = this.calculateMissionDates(mapTemplateFrequencyToMissionFrequency(template.frequency));

        // Crear la misión
        const mission = this.missionRepository.create({
            title: template.title,
            description: template.description,
            type: template.type,
            frequency: mapTemplateFrequencyToMissionFrequency(template.frequency),
            targetValue: Math.round(template.baseTargetValue * scaling.targetMultiplier),
            rewardPoints: Math.round(template.baseRewardPoints * scaling.rewardMultiplier),
            startDate,
            endDate,
            // rewardBadge: template.rewardBadge, // Eliminado ya que el campo fue removido de MissionTemplate
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
        // Buscar el escalado con el nivel más alto menor o igual al nivel del usuario
        const scaling = template.difficultyScaling
            .slice() // Crear una copia para no mutar el original si se ordena
            .sort((a, b) => a.level - b.level) // Ordenar por nivel ascendente
            .reverse() // Invertir para buscar desde el nivel más alto hacia abajo
            .find(scale => userLevel >= scale.level); // Encontrar el primer (más alto) nivel <= userLevel

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
        const startDate = new Date(now); // Start with current date/time
        const endDate = new Date(now); // Start with the current date/time

        switch (frequency) {
            case MissionFrequency.DIARIA:
                startDate.setHours(0, 0, 0, 0); // Start of the current day
                endDate.setHours(23, 59, 59, 999); // End of the current day
                break;
            case MissionFrequency.SEMANAL:
                // Start from the beginning of the current day
                startDate.setHours(0, 0, 0, 0);
                // Then set the date to the Sunday of the current week
                startDate.setDate(startDate.getDate() - startDate.getDay());

                // Start from the beginning of the current day for endDate calculation base
                endDate.setHours(0, 0, 0, 0);
                // Then set the date to the Saturday of the current week
                endDate.setDate(endDate.getDate() + (6 - endDate.getDay()));
                endDate.setHours(23, 59, 59, 999); // Set time to end of that day
                break;
            case MissionFrequency.MENSUAL:
                // Start from the beginning of the current day
                startDate.setHours(0, 0, 0, 0);
                // Then set the date to the 1st of the current month
                startDate.setDate(1);

                // Start from the beginning of the current day for endDate calculation base
                endDate.setHours(0, 0, 0, 0);
                // Then set the date to the last day of the current month
                endDate.setMonth(endDate.getMonth() + 1, 0);
                endDate.setHours(23, 59, 59, 999); // Set time to end of that day
                break;
            default:
                throw new Error(`Unknown mission frequency: ${frequency}`);
        }

        return { startDate, endDate };
    }

    async checkBonusConditions(
        userId: string,
        mission: Mission,
        progress: number
    ): Promise<number> {
        if (!mission.bonusConditions || mission.bonusConditions.length === 0) return 0;

        let totalBonus = 0;
        // No need to fetch gamification here unless bonus conditions require it
        // const gamification = await this.gamificationRepository.findOne({
        //     where: { userId }
        // });

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
                // case 'minimumLevel':
                //     const requiredLevel = parseInt(condition.value, 10);
                //     if (gamification && gamification.level >= requiredLevel) {
                //         totalBonus += mission.rewardPoints * (condition.multiplier - 1);
                //     }
                //     break;
                // case 'specificAchievements':
                //     const requiredAchievements = condition.value.split(','); // Assuming comma-separated IDs
                //     const hasAllAchievements = requiredAchievements.every(
                //         achievementId => gamification && gamification.achievements.some(a => a.id === achievementId)
                //     );
                //     if (hasAllAchievements) {
                //         totalBonus += mission.rewardPoints * (condition.multiplier - 1);
                //     }
                //     break;
                default:
                    // Handle unknown conditions gracefully
                    console.warn(`Unknown bonus condition type: ${condition.condition}`);
                    break;
            }
        }

        return Math.round(totalBonus);
    }
}
