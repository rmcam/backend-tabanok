import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm'; // Import DataSource
import { Streak } from '../entities/streak.entity';
import { GamificationService } from './gamification.service'; // Keep GamificationService for other methods if needed
import { Gamification } from '../entities/gamification.entity'; // Import Gamification entity

@Injectable()
export class StreakService {
    private readonly GRACE_PERIOD_HOURS = 24; // 1 día de gracia
    private readonly MAX_MULTIPLIER = 2.5; // Multiplicador máximo de 2.5x
    private readonly MULTIPLIER_INCREMENT = 0.1; // Incremento de 0.1 por día

    constructor(
        @InjectRepository(Streak)
        private streakRepository: Repository<Streak>,
        @InjectRepository(Gamification) // Inject Gamification repository
        private gamificationEntityRepository: Repository<Gamification>,
        private gamificationService: GamificationService, // Keep GamificationService for other methods if needed
        private dataSource: DataSource // Inject DataSource
    ) { }

    async updateStreak(userId: string, pointsEarned: number): Promise<void> {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            let streak = await queryRunner.manager.findOne(Streak, { where: { userId } }); // Use queryRunner.manager
            if (!streak) {
                streak = queryRunner.manager.create(Streak, { userId }); // Use queryRunner.manager.create
            }

            const now = new Date();
            const today = new Date(now.setHours(0, 0, 0, 0));

            // Si es la primera actividad
            if (!streak.lastActivityDate) {
                streak.currentStreak = 1;
                streak.lastActivityDate = today;
                streak.currentMultiplier = 1;
                // Move saveStreakActivity logic here
                streak.streakHistory.push({
                    date: new Date(),
                    pointsEarned,
                    bonusMultiplier: streak.currentMultiplier
                });
                // Mantener solo los últimos 30 días de historia
                if (streak.streakHistory.length > 30) {
                    streak.streakHistory = streak.streakHistory.slice(-30);
                }
                await queryRunner.manager.save(streak); // Use queryRunner.manager.save
                await queryRunner.commitTransaction();
                return;
            }

            const lastActivity = new Date(streak.lastActivityDate);
            const daysSinceLastActivity = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

            // Actividad en el mismo día
            if (daysSinceLastActivity === 0) {
                // Move saveStreakActivity logic here
                streak.streakHistory.push({
                    date: new Date(),
                    pointsEarned,
                    bonusMultiplier: streak.currentMultiplier
                });
                // Mantener solo los últimos 30 días de historia
                if (streak.streakHistory.length > 30) {
                    streak.streakHistory = streak.streakHistory.slice(-30);
                }
                await queryRunner.manager.save(streak); // Use queryRunner.manager.save
                await queryRunner.commitTransaction();
                return;
            }

            // Actividad al día siguiente
            if (daysSinceLastActivity === 1) {
                streak.currentStreak++;
                streak.currentMultiplier = Math.min(
                    streak.currentMultiplier + this.MULTIPLIER_INCREMENT,
                    this.MAX_MULTIPLIER
                );
                streak.usedGracePeriod = false;
            }
            // Período de gracia
            else if (daysSinceLastActivity === 2 && !streak.usedGracePeriod) {
                streak.usedGracePeriod = true;
                // Mantener la racha pero no aumentar el multiplicador
            }
            // Racha perdida
            else {
                streak.currentStreak = 1;
                streak.currentMultiplier = 1;
                streak.usedGracePeriod = false;
            }

            streak.lastActivityDate = today;
            if (streak.currentStreak > streak.longestStreak) {
                streak.longestStreak = streak.currentStreak;
            }

            // Move saveStreakActivity logic here
            streak.streakHistory.push({
                date: new Date(),
                pointsEarned,
                bonusMultiplier: streak.currentMultiplier
            });
            // Mantener solo los últimos 30 días de historia
            if (streak.streakHistory.length > 30) {
                streak.streakHistory = streak.streakHistory.slice(-30);
            }
            await queryRunner.manager.save(streak); // Use queryRunner.manager.save


            // Otorgar puntos con el multiplicador directly within the transaction
            const bonusPoints = Math.floor(pointsEarned * (streak.currentMultiplier - 1));
            if (bonusPoints > 0) {
                const gamification = await queryRunner.manager.findOne(Gamification, { where: { userId } }); // Fetch gamification within transaction
                if (gamification) {
                    gamification.points += bonusPoints;
                    gamification.recentActivities.unshift({
                        type: 'streak_bonus', // activityType
                        description: 'Bonus por mantener racha', // description
                        pointsEarned: bonusPoints,
                        timestamp: new Date()
                    });
                    await queryRunner.manager.save(gamification); // Save gamification changes within transaction
                }
            }

            await queryRunner.commitTransaction();

        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    // saveStreakActivity logic moved into updateStreak

    async getStreakInfo(userId: string): Promise<Streak> {
        const streak = await this.streakRepository.findOne({ where: { userId } });
        if (!streak) {
            return this.streakRepository.create({ userId });
        }
        return streak;
    }
}
