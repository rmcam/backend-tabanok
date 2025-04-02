
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Reward } from '../../reward/entities/reward.entity';
import { User } from '../../../auth/entities/user.entity';
import { CulturalAchievement } from '../entities/cultural-achievement.entity';
import { Gamification } from '../entities/gamification.entity';
import { AchievementStatus, UserAchievement } from '../entities/user-achievement.entity';
import { UserLevel } from '../entities/user-level.entity';
import { RewardStatus, UserReward } from '../entities/user-reward.entity';
import { LeaderboardService } from './leaderboard.service';
import { MissionService } from './mission.service';

@Injectable()
export class GamificationService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(CulturalAchievement)
        private readonly achievementRepository: Repository<CulturalAchievement>,
        @InjectRepository(UserAchievement)
        private readonly userAchievementRepository: Repository<UserAchievement>,
        @InjectRepository(UserLevel)
        private readonly userLevelRepository: Repository<UserLevel>,
        @InjectRepository(UserReward)
        private readonly userRewardRepository: Repository<UserReward>,
        @InjectRepository(Reward)
        private readonly rewardRepository: Repository<Reward>,
        @InjectRepository(Gamification)
        private readonly gamificationRepository: Repository<Gamification>,
        private readonly leaderboardService: LeaderboardService,
        private readonly missionService: MissionService
    ) { }

    /**
     * Obtiene estadísticas completas de gamificación para un usuario
     * @param userId - ID del usuario
     * @returns Objeto con todas las estadísticas y logros
     */
    async getUserStats(userId: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['userRewards', 'userAchievements', 'userAchievements.achievement', 'userLevel']
        });

        if (!user) {
            throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
        }

        const userLevel = await this.userLevelRepository.findOne({
            where: { userId }
        });

        return {
            points: user.points || 0,
            level: userLevel?.currentLevel || 1,
            gameStats: user.gameStats || {
                totalPoints: 0,
                level: 1,
                lessonsCompleted: 0,
                exercisesCompleted: 0,
                perfectScores: 0
            },
            achievements: user.userAchievements?.map(ua => ua.achievement) || [],
            rewards: user.userRewards || [],
            culturalPoints: user.culturalPoints || 0
        };
    }

    /**
     * Actualiza puntos de usuario y actualiza ranking
     * @param userId - ID del usuario
     * @param points - Puntos a añadir (pueden ser negativos)
     * @returns Usuario actualizado
     */
    async updateUserPoints(userId: string, points: number) {
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
        }

        user.points = (user.points || 0) + points;
        user.gameStats.totalPoints = user.points;
        
        const savedUser = await this.userRepository.save(user);
        await this.leaderboardService.updateUserRank(userId);
        
        return savedUser;
    }

    /**
     * Actualiza nivel de usuario basado en puntos acumulados
     * @param userId - ID del usuario
     * @returns Promesa con el nivel actualizado
     */
    async updateUserLevel(userId: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
        }

        // Lógica de progresión basada en puntos culturales
        const points = user.culturalPoints || 0;
        const level = this.calculateLevel(points);

        user.level = level;
        user.gameStats.level = level;

        await this.userRepository.save(user);
        
        return level;
    }

    /**
     * Otorga un logro cultural a un usuario
     * @param userId - ID del usuario
     * @param achievementId - ID del logro cultural
     * @returns Usuario actualizado
     */
    async awardAchievement(userId: string, achievementId: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['userAchievements']
        });

        if (!user) {
            throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
        }

        const achievement = await this.achievementRepository.findOne({
            where: { id: achievementId }
        });

        if (!achievement) {
            throw new NotFoundException(`Logro con ID ${achievementId} no encontrado`);
        }

        if (!user.userAchievements.some(ua => ua.achievementId === achievementId)) {
            const userAchievement = this.userAchievementRepository.create({
                userId,
                achievementId,
                dateAwarded: new Date(),
                status: AchievementStatus.COMPLETED,
                completedAt: new Date(),
                progress: {
                    current: 100,
                    total: 100,
                    steps: ['awarded']
                }
            });

            await this.userAchievementRepository.save(userAchievement);
            user.points += achievement.points || 0;
            user.culturalPoints += achievement.pointsReward || 0;
            await this.userRepository.save(user);
        }

        return user;
    }

    /**
     * Otorga una recompensa cultural a un usuario
     * @param userId - ID del usuario
     * @param rewardId - ID de la recompensa
     * @returns Objeto con recompensa y usuario
     */
    async awardReward(userId: string, rewardId: string) {
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });

        if (!user) {
            throw new NotFoundException(`Usuario con ID ${userId} no encontrado`);
        }

        const reward = await this.rewardRepository.findOne({
            where: { id: rewardId }
        });

        if (!reward) {
            throw new NotFoundException(`Recompensa con ID ${rewardId} no encontrada`);
        }

        const userReward = this.userRewardRepository.create({
            userId: userId,
            rewardId: rewardId,
            dateAwarded: new Date(),
            status: RewardStatus.ACTIVE
        });

        const savedUserReward = await this.userRewardRepository.save(userReward);
        return {
            ...savedUserReward,
            user: {
                ...user,
                rewards: [],
                progress: []
            },
            reward
        };
    }

    /**
     * Busca datos de gamificación por ID de usuario
     * @param userId - ID del usuario
     * @throws NotFoundException si no se encuentra
     * @returns Objeto Gamification
     */
    async findByUserId(userId: string): Promise<Gamification> {
        const gamification = await this.gamificationRepository.findOne({
            where: { userId },
            relations: ['culturalAchievements']
        });

        if (!gamification) {
            throw new NotFoundException(`Gamification not found for user ${userId}`);
        }

        return gamification;
    }

    /**
     * Añade puntos por actividad cultural
     * @param userId - ID del usuario
     * @param points - Puntos a añadir
     * @param activityType - Tipo de actividad (ej. 'traducción')
     * @param description - Descripción detallada
     * @returns Promesa vacía
     */
    async addPoints(
        userId: string,
        points: number,
        activityType: string,
        description: string
    ): Promise<void> {
        const gamification = await this.findByUserId(userId);

        gamification.points += points;
        gamification.recentActivities = gamification.recentActivities || [];
        gamification.recentActivities.unshift({
            type: activityType,
            description,
            pointsEarned: points,
            timestamp: new Date()
        });

        // Mantener solo las últimas 50 actividades
        if (gamification.recentActivities.length > 50) {
            gamification.recentActivities = gamification.recentActivities.slice(0, 50);
        }

        await this.gamificationRepository.save(gamification);
    }

    /**
     * Actualiza estadísticas culturales del usuario
     * @param userId - ID del usuario
     * @param stats - Objeto con estadísticas a actualizar
     * @returns Promesa vacía
     */
    async updateStats(userId: string, stats: Partial<{
        culturalContributions: number;
        translationsCompleted: number;
        audioRecordings: number;
        [key: string]: any;
    }>): Promise<void> {
        const gamification = await this.findByUserId(userId);

        gamification.stats = {
            ...gamification.stats,
            ...stats
        };

        await this.gamificationRepository.save(gamification);
    }

    // Métodos privados
    private calculateLevel(points: number): number {
        // Lógica de progresión basada en puntos culturales
        if (points < 100) return 1;
        if (points < 300) return 2;
        if (points < 600) return 3;
        if (points < 1000) return 4;
        return 5 + Math.floor((points - 1000) / 500);
    }

    /**
     * Verifica y otorga misiones completadas
     * @param userId - ID del usuario
     * @param missionType - Tipo de misión completada
     */
    private async checkCompletedMissions(userId: string, missionType: string) {
        // Implementación pendiente de MissionService
        // await this.missionService.checkMissionCompletion(userId, missionType);
    }
}
