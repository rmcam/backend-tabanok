import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Gamification } from '../entities/gamification.entity';
import { Leaderboard } from '../entities/leaderboard.entity';
import { LeaderboardCategory, LeaderboardType } from '../enums/leaderboard.enum';
import { LeaderboardRepository } from '../repositories/leaderboard.repository';

@Injectable()
export class LeaderboardService {
    constructor(
        private leaderboardRepository: LeaderboardRepository,
        @InjectRepository(Gamification)
        private gamificationRepository: Repository<Gamification>
    ) { }

    async updateLeaderboards(): Promise<void> {
        await Promise.all([
            this.updateDailyLeaderboards(),
            this.updateWeeklyLeaderboards(),
            this.updateMonthlyLeaderboards(),
            this.updateAllTimeLeaderboards()
        ]);
    }

    private async updateDailyLeaderboards(): Promise<void> {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        await this.updateLeaderboardsByType(LeaderboardType.DAILY, today, tomorrow);
    }

    private async updateWeeklyLeaderboards(): Promise<void> {
        const now = new Date();
        const startOfWeek = new Date(now);
        startOfWeek.setHours(0, 0, 0, 0);
        startOfWeek.setDate(now.getDate() - now.getDay());

        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);

        await this.updateLeaderboardsByType(LeaderboardType.WEEKLY, startOfWeek, endOfWeek);
    }

    private async updateMonthlyLeaderboards(): Promise<void> {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        await this.updateLeaderboardsByType(LeaderboardType.MONTHLY, startOfMonth, endOfMonth);
    }

    private async updateAllTimeLeaderboards(): Promise<void> {
        const startDate = new Date(0); // Inicio del tiempo Unix
        const endDate = new Date(8640000000000000); // Máxima fecha posible en JS

        await this.updateLeaderboardsByType(LeaderboardType.ALL_TIME, startDate, endDate);
    }

    private async updateLeaderboardsByType(
        type: LeaderboardType,
        startDate: Date,
        endDate: Date
    ): Promise<void> {
        for (const category of Object.values(LeaderboardCategory)) {
            let leaderboard = await this.leaderboardRepository.findOne({
                where: {
                    type,
                    category,
                    startDate: LessThanOrEqual(startDate),
                    endDate: MoreThanOrEqual(endDate)
                }
            });

            if (!leaderboard) {
                leaderboard = this.leaderboardRepository.create({
                    type,
                    category,
                    startDate,
                    endDate,
                    rankings: [],
                    rewards: this.getDefaultRewards(type)
                });
            }

            const rankings = await this.calculateRankings(category, startDate, endDate);
            const previousRankings = leaderboard.rankings;

            leaderboard.rankings = rankings.map((rank, index) => ({
                ...rank,
                rank: index + 1,
                change: this.calculateRankChange(rank.userId, index + 1, previousRankings)
            }));

            leaderboard.lastUpdated = new Date();
            await this.leaderboardRepository.save(leaderboard);
        }
    }

    private async calculateRankings(
        category: LeaderboardCategory,
        startDate: Date,
        endDate: Date
    ): Promise<Array<{ userId: string; name: string; score: number; achievements: string[] }>> {
        const gamifications = await this.gamificationRepository.find({
            relations: ['user', 'achievements', 'stats'],
        });

        return gamifications.filter(g => g.user)
            .map(g => ({
                userId: g.user.id,
                name: `${g.user.firstName} ${g.user.lastName}`,
                score: this.calculateScore(g, category),
                achievements: g.achievements.map(a => a.id)
            }))
            .sort((a, b) => b.score - a.score)
            .slice(0, 100); // Top 100
    }

    private calculateScore(gamification: Gamification, category: LeaderboardCategory): number {
        switch (category) {
            case LeaderboardCategory.POINTS:
                return gamification.points;
            case LeaderboardCategory.LESSONS_COMPLETED:
                return gamification.stats.lessonsCompleted;
            case LeaderboardCategory.EXERCISES_COMPLETED:
                return gamification.stats.exercisesCompleted;
            case LeaderboardCategory.PERFECT_SCORES:
                return gamification.stats.perfectScores;
            case LeaderboardCategory.LEARNING_STREAK:
                return gamification.stats.learningStreak;
            case LeaderboardCategory.CULTURAL_CONTRIBUTIONS:
                return gamification.stats.culturalContributions;
            default:
                return 0;
        }
    }

    private calculateRankChange(
        userId: string,
        currentRank: number,
        previousRankings: Leaderboard['rankings']
    ): number {
        const previousRank = previousRankings.find(r => r.userId === userId)?.rank || currentRank;
        return previousRank - currentRank;
    }

    private getDefaultRewards(type: LeaderboardType): Array<{ rank: number; points: number; badge?: any }> {
        switch (type) {
            case LeaderboardType.DAILY:
                return [
                    { rank: 1, points: 100 },
                    { rank: 2, points: 50 },
                    { rank: 3, points: 25 }
                ];
            case LeaderboardType.WEEKLY:
                return [
                    {
                        rank: 1,
                        points: 500,
                        badge: { id: 'weekly-champion', name: 'Campeón Semanal', icon: '👑' }
                    },
                    { rank: 2, points: 250 },
                    { rank: 3, points: 100 }
                ];
            case LeaderboardType.MONTHLY:
                return [
                    {
                        rank: 1,
                        points: 2000,
                        badge: { id: 'monthly-champion', name: 'Campeón Mensual', icon: '🏆' }
                    },
                    {
                        rank: 2,
                        points: 1000,
                        badge: { id: 'monthly-runner-up', name: 'Subcampeón Mensual', icon: '🥈' }
                    },
                    { rank: 3, points: 500 }
                ];
            default:
                return [];
        }
    }

    async getLeaderboard(
        type: LeaderboardType,
        category: LeaderboardCategory
    ): Promise<Leaderboard> {
        return this.leaderboardRepository.findActiveByTypeAndCategory(type, category);
    }

    async getUserRank(
        userId: string,
        type: LeaderboardType,
        category: LeaderboardCategory
    ): Promise<{ rank: number; total: number }> {
        const leaderboard = await this.getLeaderboard(type, category);
        if (!leaderboard) {
            return { rank: 0, total: 0 };
        }

        const userRanking = leaderboard.rankings.find(r => r.userId === userId);
        return {
            rank: userRanking?.rank || 0,
            total: leaderboard.rankings.length
        };
    }

    async updateUserRank(userId: string): Promise<void> {
        const gamification = await this.gamificationRepository.findOne({
            where: { user: { id: userId } },
            relations: ['user', 'achievements']
        });

        if (!gamification) {
            return;
        }

        const now = new Date();
        const leaderboards = await this.leaderboardRepository.find({
            where: [
                { startDate: LessThanOrEqual(now), endDate: MoreThanOrEqual(now) },
                { type: LeaderboardType.ALL_TIME }
            ]
        });

        await Promise.all(leaderboards.map(async leaderboard => {
            const score = this.calculateScore(gamification, leaderboard.category);
            const achievements = gamification.achievements.map(a => a.id);
            
            await this.leaderboardRepository.updateUserRanking(
                leaderboard.id,
                userId,
                score,
                achievements
            );
            
            await this.leaderboardRepository.calculateRanks(leaderboard.id);
        }));
    }
}
