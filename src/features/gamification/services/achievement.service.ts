import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement } from '../entities/achievement.entity';
import { Badge } from '../entities/badge.entity';
import { Gamification } from '../entities/gamification.entity';

@Injectable()
export class AchievementService {
    constructor(
        @InjectRepository(Achievement)
        private achievementRepository: Repository<Achievement>,
        @InjectRepository(Gamification)
        private gamificationRepository: Repository<Gamification>,
        @InjectRepository(Badge)
        private badgeRepository: Repository<Badge>
    ) { }

    async checkAndAwardAchievements(userId: string): Promise<void> {
        const gamification = await this.gamificationRepository.findOne({
            where: { userId },
            relations: ['achievements', 'badges']
        });

        if (!gamification) {
            return;
        }

        const achievements = await this.achievementRepository.find();

        for (const achievement of achievements) {
            if (gamification.achievements.some(a => a.id === achievement.id)) {
                continue; // Ya tiene este logro
            }

            const isCompleted = await this.checkAchievementCompletion(
                achievement,
                gamification
            );

            if (isCompleted) {
                await this.awardAchievement(achievement, gamification);
            }
        }
    }

    private async checkAchievementCompletion(
        achievement: Achievement,
        gamification: Gamification
    ): Promise<boolean> {
        switch (achievement.type) {
            case 'LEVEL_REACHED':
                return gamification.level >= achievement.requirement;
            case 'LESSONS_COMPLETED':
                return gamification.stats.lessonsCompleted >= achievement.requirement;
            case 'PERFECT_SCORES':
                return gamification.stats.perfectScores >= achievement.requirement;
            case 'STREAK_MAINTAINED':
                return gamification.stats.learningStreak >= achievement.requirement;
            case 'CULTURAL_CONTRIBUTIONS':
                return gamification.stats.culturalContributions >= achievement.requirement;
            case 'POINTS_EARNED':
                return gamification.points >= achievement.requirement;
            default:
                return false;
        }
    }

    private async awardAchievement(
        achievement: Achievement,
        gamification: Gamification
    ): Promise<void> {
        // Agregar el logro a la lista del usuario
        gamification.achievements.push(achievement);

        // Otorgar puntos de bonificación
        gamification.points += achievement.bonusPoints;
        gamification.experience += achievement.bonusPoints;

        // Otorgar insignia si existe
        if (achievement.badge) {
            const badge = await this.badgeRepository.findOne({
                where: { id: achievement.badge.id }
            });
            if (badge) {
                gamification.badges.push(badge);
            }
        }

        // Registrar la actividad
        gamification.recentActivities.unshift({
            type: 'achievement_unlocked',
            description: `¡Logro desbloqueado: ${achievement.name}!`,
            pointsEarned: achievement.bonusPoints,
            timestamp: new Date()
        });

        await this.gamificationRepository.save(gamification);
    }

    async getAvailableAchievements(userId: string): Promise<Achievement[]> {
        const gamification = await this.gamificationRepository.findOne({
            where: { userId },
            relations: ['achievements']
        });

        if (!gamification) {
            return [];
        }

        const allAchievements = await this.achievementRepository.find();
        const unlockedAchievementIds = gamification.achievements.map(a => a.id);

        return allAchievements.filter(
            achievement => !unlockedAchievementIds.includes(achievement.id)
        );
    }

    async getUserAchievements(userId: string): Promise<Achievement[]> {
        const gamification = await this.gamificationRepository.findOne({
            where: { userId },
            relations: ['achievements']
        });

        return gamification?.achievements || [];
    }
} 