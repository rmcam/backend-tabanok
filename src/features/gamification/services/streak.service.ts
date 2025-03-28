import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Streak } from '../entities/streak.entity';
import { GamificationService } from '../gamification.service';

@Injectable()
export class StreakService {
    private readonly GRACE_PERIOD_HOURS = 24; // 1 día de gracia
    private readonly MAX_MULTIPLIER = 2.5; // Multiplicador máximo de 2.5x
    private readonly MULTIPLIER_INCREMENT = 0.1; // Incremento de 0.1 por día

    constructor(
        @InjectRepository(Streak)
        private streakRepository: Repository<Streak>,
        private gamificationService: GamificationService,
    ) { }

    async updateStreak(userId: string, pointsEarned: number): Promise<void> {
        let streak = await this.streakRepository.findOne({ where: { userId } });
        if (!streak) {
            streak = this.streakRepository.create({ userId });
        }

        const now = new Date();
        const today = new Date(now.setHours(0, 0, 0, 0));

        // Si es la primera actividad
        if (!streak.lastActivityDate) {
            streak.currentStreak = 1;
            streak.lastActivityDate = today;
            streak.currentMultiplier = 1;
            await this.saveStreakActivity(streak, pointsEarned);
            return;
        }

        const lastActivity = new Date(streak.lastActivityDate);
        const daysSinceLastActivity = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

        // Actividad en el mismo día
        if (daysSinceLastActivity === 0) {
            await this.saveStreakActivity(streak, pointsEarned);
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

        await this.saveStreakActivity(streak, pointsEarned);

        // Otorgar puntos con el multiplicador
        const bonusPoints = Math.floor(pointsEarned * (streak.currentMultiplier - 1));
        if (bonusPoints > 0) {
            await this.gamificationService.addPoints(
                userId,
                bonusPoints,
                'streak_bonus',
                `¡Bonus de racha ${streak.currentStreak} días! (${streak.currentMultiplier}x)`
            );
        }
    }

    private async saveStreakActivity(streak: Streak, pointsEarned: number): Promise<void> {
        streak.streakHistory.push({
            date: new Date(),
            pointsEarned,
            bonusMultiplier: streak.currentMultiplier
        });

        // Mantener solo los últimos 30 días de historia
        if (streak.streakHistory.length > 30) {
            streak.streakHistory = streak.streakHistory.slice(-30);
        }

        await this.streakRepository.save(streak);
    }

    async getStreakInfo(userId: string): Promise<Streak> {
        const streak = await this.streakRepository.findOne({ where: { userId } });
        if (!streak) {
            return this.streakRepository.create({ userId });
        }
        return streak;
    }
} 