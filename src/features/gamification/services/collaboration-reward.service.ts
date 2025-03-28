import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Badge } from '../entities/badge.entity';
import { CollaborationReward, CollaborationType } from '../entities/collaboration-reward.entity';
import { Gamification } from '../entities/gamification.entity';

@Injectable()
export class CollaborationRewardService {
    constructor(
        @InjectRepository(CollaborationReward)
        private collaborationRewardRepository: Repository<CollaborationReward>,
        @InjectRepository(Gamification)
        private gamificationRepository: Repository<Gamification>
    ) { }

    async awardCollaboration(
        userId: string,
        contributionId: string,
        type: CollaborationType,
        quality: 'excellent' | 'good' | 'average',
        reviewerId?: string
    ): Promise<void> {
        const reward = await this.collaborationRewardRepository.findOne({
            where: { type }
        });

        if (!reward) {
            throw new NotFoundException(`No reward configuration found for type ${type}`);
        }

        const gamification = await this.gamificationRepository.findOne({
            where: { userId }
        });

        if (!gamification) {
            throw new NotFoundException(`Gamification profile not found for user ${userId}`);
        }

        // Calcular puntos base con multiplicador de calidad
        const basePoints = reward.basePoints;
        const qualityMultiplier = reward.qualityMultipliers[quality];
        let pointsToAward = basePoints * qualityMultiplier;

        // Verificar bonificación por racha
        const userContributions = reward.history.filter(h => h.userId === userId);
        const streakDays = this.calculateContributionStreak(userContributions);
        const streakBonus = this.calculateStreakBonus(streakDays, reward.streakBonuses);
        pointsToAward *= (1 + streakBonus);

        // Registrar la colaboración
        reward.history.push({
            userId,
            contributionId,
            type,
            quality,
            pointsAwarded: pointsToAward,
            awardedAt: new Date(),
            reviewedBy: reviewerId
        });

        // Actualizar el perfil de gamificación
        gamification.points += pointsToAward;

        // Verificar y otorgar insignia especial si corresponde
        if (reward.specialBadge) {
            const userContributionsCount = reward.history.filter(
                h => h.userId === userId && h.quality === 'excellent'
            ).length;

            if (userContributionsCount >= reward.specialBadge.requirementCount) {
                if (!gamification.badges) {
                    gamification.badges = [];
                }
                if (!gamification.badges.some(b => b.id === reward.specialBadge.id)) {
                    const fullBadge: Badge = {
                        ...reward.specialBadge,
                        description: `Insignia especial por ${userContributionsCount} contribuciones excelentes de tipo ${type}`,
                        category: 'collaboration',
                        tier: 'gold' as const,
                        requiredPoints: 0,
                        iconUrl: reward.specialBadge.icon,
                        requirements: {
                            customCriteria: {
                                type: 'excellent_contributions',
                                value: reward.specialBadge.requirementCount
                            }
                        },
                        isSpecial: true,
                        timesAwarded: 1,
                        benefits: [],
                        createdAt: new Date(),
                        updatedAt: new Date(),
                        expirationDate: null
                    };
                    gamification.badges.push(fullBadge);
                }
            }
        }

        // Registrar actividad
        gamification.recentActivities.unshift({
            type: 'collaboration',
            description: `Contribución ${type.toLowerCase()} - Calidad: ${quality}`,
            pointsEarned: pointsToAward,
            timestamp: new Date()
        });

        // Guardar cambios
        await Promise.all([
            this.collaborationRewardRepository.save(reward),
            this.gamificationRepository.save(gamification)
        ]);
    }

    private calculateContributionStreak(contributions: Array<{ awardedAt: Date }>): number {
        if (contributions.length === 0) return 0;

        contributions.sort((a, b) => b.awardedAt.getTime() - a.awardedAt.getTime());
        let streak = 1;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastContribution = new Date(contributions[0].awardedAt);
        lastContribution.setHours(0, 0, 0, 0);

        // Si la última contribución no fue hoy o ayer, no hay racha
        if ((today.getTime() - lastContribution.getTime()) / (1000 * 60 * 60 * 24) > 1) {
            return 0;
        }

        for (let i = 1; i < contributions.length; i++) {
            const current = new Date(contributions[i].awardedAt);
            current.setHours(0, 0, 0, 0);
            const previous = new Date(contributions[i - 1].awardedAt);
            previous.setHours(0, 0, 0, 0);

            const daysDiff = (previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24);

            if (daysDiff === 1) {
                streak++;
            } else {
                break;
            }
        }

        return streak;
    }

    private calculateStreakBonus(
        streakDays: number,
        streakBonuses: Array<{ threshold: number; multiplier: number }>
    ): number {
        const applicableBonus = streakBonuses
            .sort((a, b) => b.threshold - a.threshold)
            .find(bonus => streakDays >= bonus.threshold);

        return applicableBonus ? applicableBonus.multiplier : 0;
    }

    async getCollaborationStats(userId: string): Promise<{
        totalContributions: number;
        excellentContributions: number;
        currentStreak: number;
        totalPoints: number;
        badges: Array<{
            id: string;
            name: string;
            icon: string;
            description: string;
            category: string;
            tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
            iconUrl: string;
        }>;
    }> {
        const rewards = await this.collaborationRewardRepository.find();
        const userContributions = rewards.flatMap(r =>
            r.history.filter(h => h.userId === userId)
        );

        return {
            totalContributions: userContributions.length,
            excellentContributions: userContributions.filter(c => c.quality === 'excellent').length,
            currentStreak: this.calculateContributionStreak(userContributions),
            totalPoints: userContributions.reduce((sum, c) => sum + c.pointsAwarded, 0),
            badges: rewards
                .filter(r => r.specialBadge)
                .filter(r => {
                    const excellentCount = r.history.filter(
                        h => h.userId === userId && h.quality === 'excellent'
                    ).length;
                    return excellentCount >= r.specialBadge.requirementCount;
                })
                .map(r => ({
                    id: r.specialBadge.id,
                    name: r.specialBadge.name,
                    icon: r.specialBadge.icon,
                    description: `Insignia especial por contribuciones excelentes de tipo ${r.type}`,
                    category: 'collaboration',
                    tier: 'gold' as const,
                    iconUrl: r.specialBadge.icon
                }))
        };
    }
} 