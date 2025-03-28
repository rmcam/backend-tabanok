import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { CreateMissionDto } from '../dto/create-mission.dto';
import { Badge } from '../entities/badge.entity';
import { Gamification } from '../entities/gamification.entity';
import { Mission, MissionFrequency, MissionType } from '../entities/mission.entity';

@Injectable()
export class MissionService {
    constructor(
        @InjectRepository(Mission)
        private missionRepository: Repository<Mission>,
        @InjectRepository(Gamification)
        private gamificationRepository: Repository<Gamification>
    ) { }

    async createMission(createMissionDto: CreateMissionDto): Promise<Mission> {
        const mission = this.missionRepository.create(createMissionDto);
        return this.missionRepository.save(mission);
    }

    async getActiveMissions(userId: string): Promise<Mission[]> {
        const now = new Date();
        return this.missionRepository.find({
            where: {
                startDate: LessThanOrEqual(now),
                endDate: MoreThanOrEqual(now)
            },
            order: {
                endDate: 'ASC'
            }
        });
    }

    async updateMissionProgress(userId: string, type: MissionType, progress: number): Promise<void> {
        const activeMissions = await this.getActiveMissions(userId);
        const relevantMissions = activeMissions.filter(mission => mission.type === type);

        for (const mission of relevantMissions) {
            const userProgress = mission.completedBy.find(completion => completion.userId === userId);

            if (!userProgress) {
                mission.completedBy.push({
                    userId,
                    progress,
                    completedAt: progress >= mission.targetValue ? new Date() : null
                });
            } else {
                userProgress.progress = progress;
                if (progress >= mission.targetValue && !userProgress.completedAt) {
                    userProgress.completedAt = new Date();
                    await this.awardMissionRewards(userId, mission);
                }
            }

            await this.missionRepository.save(mission);
        }
    }

    private async awardMissionRewards(userId: string, mission: Mission): Promise<void> {
        const gamification = await this.gamificationRepository.findOne({
            where: { userId }
        });

        if (!gamification) {
            throw new NotFoundException(`Gamification profile not found for user ${userId}`);
        }

        // Otorgar puntos
        gamification.points += mission.rewardPoints;

        // Otorgar insignia si existe
        if (mission.rewardBadge) {
            if (!gamification.badges) {
                gamification.badges = [];
            }
            const fullBadge: Badge = {
                ...mission.rewardBadge,
                description: `Insignia por completar la misión: ${mission.title}`,
                category: 'achievement',
                tier: 'gold',
                requiredPoints: mission.rewardPoints,
                iconUrl: mission.rewardBadge.icon,
                requirements: {},
                isSpecial: false,
                timesAwarded: 0,
                benefits: [],
                createdAt: new Date(),
                updatedAt: new Date(),
                expirationDate: null
            };
            gamification.badges.push(fullBadge);
        }

        // Registrar actividad
        gamification.recentActivities.unshift({
            type: 'mission_completed',
            description: `¡Misión completada: ${mission.title}!`,
            pointsEarned: mission.rewardPoints,
            timestamp: new Date()
        });

        await this.gamificationRepository.save(gamification);
    }

    async generateDailyMissions(): Promise<Mission[]> {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const dailyMissions = [
            {
                title: 'Completar 3 lecciones',
                description: 'Completa 3 lecciones hoy',
                type: MissionType.COMPLETE_LESSONS,
                frequency: MissionFrequency.DAILY,
                targetValue: 3,
                rewardPoints: 50,
                startDate: today,
                endDate: tomorrow
            },
            {
                title: 'Práctica perfecta',
                description: 'Obtén una puntuación perfecta en 2 ejercicios',
                type: MissionType.PRACTICE_EXERCISES,
                frequency: MissionFrequency.DAILY,
                targetValue: 2,
                rewardPoints: 75,
                startDate: today,
                endDate: tomorrow
            },
            {
                title: 'Explorador cultural',
                description: 'Lee 2 contenidos culturales',
                type: MissionType.CULTURAL_CONTENT,
                frequency: MissionFrequency.DAILY,
                targetValue: 2,
                rewardPoints: 40,
                startDate: today,
                endDate: tomorrow
            }
        ];

        const missions = await Promise.all(
            dailyMissions.map(mission => this.createMission(mission))
        );

        return missions;
    }

    async generateWeeklyMissions(): Promise<Mission[]> {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setHours(0, 0, 0, 0);
        startOfWeek.setDate(now.getDate() - now.getDay());

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        const weeklyMissions = [
            {
                title: 'Maestro del aprendizaje',
                description: 'Completa 15 lecciones esta semana',
                type: MissionType.COMPLETE_LESSONS,
                frequency: MissionFrequency.WEEKLY,
                targetValue: 15,
                rewardPoints: 200,
                startDate: startOfWeek,
                endDate: endOfWeek,
                rewardBadge: {
                    id: 'weekly-master',
                    name: 'Maestro Semanal',
                    icon: '🏆'
                }
            },
            {
                title: 'Contribuidor cultural',
                description: 'Realiza 5 contribuciones culturales',
                type: MissionType.CULTURAL_CONTENT,
                frequency: MissionFrequency.WEEKLY,
                targetValue: 5,
                rewardPoints: 300,
                startDate: startOfWeek,
                endDate: endOfWeek
            }
        ];

        const missions = await Promise.all(
            weeklyMissions.map(mission => this.createMission(mission))
        );

        return missions;
    }
} 