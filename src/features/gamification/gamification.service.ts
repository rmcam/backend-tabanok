import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateGamificationDto } from './dto/create-gamification.dto';
import { Achievement } from './entities/achievement.entity';
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
                const meetsRequirements = this.evaluateAchievementCriteria(gamification, achievement);
                if (meetsRequirements) {
                    gamification.achievements.push(achievement);
                    gamification.points += achievement.pointsReward;

                    // Agregar actividad de logro conseguido
                    gamification.recentActivities.unshift({
                        type: 'achievement',
                        description: `¡Logro desbloqueado: ${achievement.name}!`,
                        pointsEarned: achievement.pointsReward,
                        timestamp: new Date(),
                    });
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

    private evaluateAchievementCriteria(gamification: Gamification, achievement: Achievement): boolean {
        const { type, value, comparison, additionalParams } = achievement.criteria;

        switch (type) {
            case 'points':
                return this.compareValues(gamification.points, value, comparison);
            case 'level':
                return this.compareValues(gamification.level, value, comparison);
            case 'lessonsCompleted':
                return this.compareValues(gamification.stats.lessonsCompleted, value, comparison);
            case 'exercisesCompleted':
                return this.compareValues(gamification.stats.exercisesCompleted, value, comparison);
            case 'perfectScores':
                return this.compareValues(gamification.stats.perfectScores, value, comparison);
            case 'learningStreak':
                return this.compareValues(gamification.stats.learningStreak, value, comparison);
            default:
                return false;
        }
    }

    private evaluateBadgeRequirements(gamification: Gamification, badge: Badge): boolean {
        const { achievements, points, level, customCriteria } = badge.requirements;

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

        // Verificar criterios personalizados
        if (customCriteria) {
            // Implementar lógica para criterios personalizados según sea necesario
        }

        return true;
    }

    private compareValues(actual: number, target: number, comparison: string): boolean {
        switch (comparison) {
            case 'equals':
                return actual === target;
            case 'greater':
                return actual > target;
            case 'less':
                return actual < target;
            case 'between':
                // Para 'between', target debe ser un array de dos números
                if (Array.isArray(target)) {
                    return actual >= target[0] && actual <= target[1];
                }
                return false;
            default:
                return false;
        }
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

        // Verificar y actualizar insignias
        await this.checkBadges(gamification);

        return this.gamificationRepository.save(gamification);
    }
} 