import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGamificationDto } from './dto/create-gamification.dto';
import { Achievement, AchievementType } from './entities/achievement.entity';
import { Badge } from './entities/badge.entity';
import { Gamification } from './entities/gamification.entity';

@Injectable()
export class GamificationService {
    constructor(
        @InjectRepository(Gamification)
        private gamificationRepository: Repository<Gamification>,
        @InjectRepository(Achievement)
        private achievementRepository: Repository<Achievement>,
        @InjectRepository(Badge)
        private badgeRepository: Repository<Badge>,
    ) { }

    async create(createGamificationDto: CreateGamificationDto): Promise<Gamification> {
        const gamification = this.gamificationRepository.create(createGamificationDto);
        return this.gamificationRepository.save(gamification);
    }

    async findAll(): Promise<Gamification[]> {
        return this.gamificationRepository.find();
    }

    async findOne(id: string): Promise<Gamification> {
        const gamification = await this.gamificationRepository.findOne({ where: { id } });
        if (!gamification) {
            throw new NotFoundException(`Gamification with ID ${id} not found`);
        }
        return gamification;
    }

    async findByUserId(userId: string): Promise<Gamification> {
        const gamification = await this.gamificationRepository.findOne({ where: { userId } });
        if (!gamification) {
            throw new NotFoundException(`Gamification for user ${userId} not found`);
        }
        return gamification;
    }

    async addPoints(userId: string, points: number, activityType: string, description: string): Promise<Gamification> {
        const gamification = await this.findByUserId(userId);

        // Actualizar puntos y experiencia
        gamification.points += points;
        gamification.experience += points;

        // Verificar si sube de nivel
        while (gamification.experience >= gamification.nextLevelExperience) {
            gamification.level += 1;
            gamification.experience -= gamification.nextLevelExperience;
            gamification.nextLevelExperience = Math.floor(gamification.nextLevelExperience * 1.5);
        }

        // Agregar actividad reciente
        gamification.recentActivities.unshift({
            type: activityType,
            description,
            pointsEarned: points,
            timestamp: new Date(),
        });

        // Mantener solo las últimas 10 actividades
        if (gamification.recentActivities.length > 10) {
            gamification.recentActivities = gamification.recentActivities.slice(0, 10);
        }

        // Verificar y actualizar logros
        await this.checkAchievements(gamification);

        // Verificar y actualizar insignias
        await this.checkBadges(gamification);

        return this.gamificationRepository.save(gamification);
    }

    private async checkAchievements(gamification: Gamification): Promise<void> {
        const allAchievements = await this.achievementRepository.find();

        for (const achievement of allAchievements) {
            const hasAchievement = gamification.achievements.some(a => a.id === achievement.id);
            if (!hasAchievement) {
                const meetsRequirements = this.evaluateAchievementRequirements(gamification, achievement);
                if (meetsRequirements) {
                    gamification.achievements.push(achievement);
                    gamification.points += achievement.bonusPoints;

                    // Registrar el desbloqueo del logro
                    achievement.unlockedBy.push({
                        userId: gamification.userId,
                        unlockedAt: new Date()
                    });
                    await this.achievementRepository.save(achievement);

                    // Agregar actividad de logro conseguido
                    gamification.recentActivities.unshift({
                        type: 'achievement',
                        description: `¡Logro desbloqueado: ${achievement.name}!`,
                        pointsEarned: achievement.bonusPoints,
                        timestamp: new Date(),
                    });

                    // Otorgar insignia si existe
                    if (achievement.badge) {
                        const fullBadge: Badge = {
                            ...achievement.badge,
                            description: achievement.badge.description || `Insignia por completar el logro: ${achievement.name}`,
                            category: 'achievement',
                            tier: 'gold',
                            requiredPoints: achievement.requirement,
                            iconUrl: achievement.badge.icon,
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
                }
            }
        }
    }

    private async checkBadges(gamification: Gamification): Promise<void> {
        const allBadges = await this.badgeRepository.find();

        for (const badge of allBadges) {
            const hasBadge = gamification.badges.some(b => b.id === badge.id);
            if (!hasBadge) {
                const meetsRequirements = this.evaluateBadgeRequirements(gamification, badge);
                if (meetsRequirements) {
                    gamification.badges.push(badge);

                    // Agregar actividad de insignia conseguida
                    gamification.recentActivities.unshift({
                        type: 'badge',
                        description: `¡Nueva insignia obtenida: ${badge.name}!`,
                        pointsEarned: 0,
                        timestamp: new Date(),
                    });
                }
            }
        }
    }

    private evaluateAchievementRequirements(gamification: Gamification, achievement: Achievement): boolean {
        switch (achievement.type) {
            case AchievementType.LEVEL_REACHED:
                return gamification.level >= achievement.requirement;
            case AchievementType.LESSONS_COMPLETED:
                return gamification.stats.lessonsCompleted >= achievement.requirement;
            case AchievementType.PERFECT_SCORES:
                return gamification.stats.perfectScores >= achievement.requirement;
            case AchievementType.STREAK_MAINTAINED:
                return gamification.stats.learningStreak >= achievement.requirement;
            case AchievementType.CULTURAL_CONTRIBUTIONS:
                return gamification.stats.culturalContributions >= achievement.requirement;
            case AchievementType.POINTS_EARNED:
                return gamification.points >= achievement.requirement;
            default:
                return false;
        }
    }

    private evaluateBadgeRequirements(gamification: Gamification, badge: Badge): boolean {
        const { achievements, points, level } = badge.requirements;

        // Verificar requisitos de logros
        if (achievements?.length > 0) {
            const hasAllAchievements = achievements.every(achievementId =>
                gamification.achievements.some(a => a.id === achievementId)
            );
            if (!hasAllAchievements) return false;
        }

        // Verificar puntos requeridos
        if (points && gamification.points < points) return false;

        // Verificar nivel requerido
        if (level && gamification.level < level) return false;

        return true;
    }

    async updateStats(userId: string, stats: Partial<Gamification['stats']>): Promise<Gamification> {
        const gamification = await this.findByUserId(userId);

        // Actualizar estadísticas
        gamification.stats = {
            ...gamification.stats,
            ...stats,
        };

        // Verificar y actualizar logros
        await this.checkAchievements(gamification);

        return this.gamificationRepository.save(gamification);
    }
} 