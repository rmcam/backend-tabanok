import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm'; // Import DataSource and QueryRunner
import { Achievement } from '../entities/achievement.entity';
import { Badge } from '../entities/badge.entity';
import { Gamification } from '../entities/gamification.entity';
import { AchievementDto } from '../dto/achievement.dto';
import { StreakService } from './streak.service';

@Injectable()
export class AchievementService {
    constructor(
        @InjectRepository(Achievement)
        private achievementRepository: Repository<Achievement>,
        @InjectRepository(Gamification)
        private gamificationRepository: Repository<Gamification>,
        @InjectRepository(Badge)
        private badgeRepository: Repository<Badge>,
        private streakService: StreakService,
        private dataSource: DataSource // Inject DataSource
    ) { }

    async createAchievement(achievementDto: AchievementDto): Promise<Achievement> {
        const achievement = this.achievementRepository.create(achievementDto);
        return this.achievementRepository.save(achievement);
    }

    async updateAchievement(id: string, achievementDto: AchievementDto): Promise<Achievement> {
        const achievement = await this.achievementRepository.findOne({ where: { id } });
        if (!achievement) {
            throw new Error(`Achievement with id ${id} not found`);
        }
        Object.assign(achievement, achievementDto);
        return this.achievementRepository.save(achievement);
    }

    async checkAndAwardAchievements(userId: string): Promise<void> {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const gamification = await queryRunner.manager.findOne(Gamification, {
                where: { userId },
                relations: ['achievements', 'badges']
            });

            if (!gamification) {
                await queryRunner.commitTransaction(); // Commit empty transaction
                return;
            }

            const achievements = await queryRunner.manager.find(Achievement);

            for (const achievement of achievements) {
                if (gamification.achievements.some(a => a.id === achievement.id)) {
                    continue; // Ya tiene este logro
                }

                const isCompleted = await this.checkAchievementCompletion(
                    achievement,
                    gamification
                );

                if (isCompleted) {
                    await this.awardAchievement(achievement, gamification, queryRunner); // Pass queryRunner
                }
            }

            await queryRunner.manager.save(gamification); // Save gamification changes after the loop
            await queryRunner.commitTransaction();

        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    private async checkAchievementCompletion(
        achievement: Achievement,
        gamification: Gamification
    ): Promise<boolean> {
        if (achievement.criteria === 'LEVEL_REACHED') {
            return gamification.level >= achievement.requirement;
        } else if (achievement.criteria === 'LESSONS_COMPLETED') {
            return gamification.stats.lessonsCompleted >= achievement.requirement;
        } else if (achievement.criteria === 'EXERCISES_COMPLETED') {
            return gamification.stats.exercisesCompleted >= achievement.requirement;
        } else if (achievement.criteria === 'PERFECT_SCORES') {
            return gamification.stats.perfectScores >= achievement.requirement;
        } else if (achievement.criteria === 'STREAK_MAINTAINED') {
            // StreakService might perform reads, but not writes relevant to this transaction
            const streak = await this.streakService.getStreakInfo(gamification.userId);
            return streak.currentStreak >= achievement.requirement;
        } else if (achievement.criteria === 'CULTURAL_CONTRIBUTIONS') {
            return gamification.stats.culturalContributions >= achievement.requirement;
        } else if (achievement.criteria === 'POINTS_EARNED') {
            return gamification.points >= achievement.requirement;
        } else if (achievement.criteria === 'FIRST_DAILY_LOGIN') {
            const today = new Date().toISOString().split('T')[0];
            const hasLoggedInToday = gamification.recentActivities.some(
                (activity) =>
                    activity.type === 'login' &&
                    activity.timestamp.toISOString().split('T')[0] === today
            );
            return hasLoggedInToday;
        } else {
            return false;
        }
    }

    private async awardAchievement(
        achievement: Achievement,
        gamification: Gamification,
        queryRunner: QueryRunner // Accept queryRunner
    ): Promise<void> {
        // Agregar el logro a la lista del usuario
        gamification.achievements.push(achievement);

        // Otorgar puntos de bonificación
        gamification.points += achievement.bonusPoints;
        gamification.experience += achievement.bonusPoints;

        // TODO: Implementar lógica para otorgar insignia si aplica, posiblemente buscando por un ID de insignia asociado al logro si se redefine la relación.

        // Registrar la actividad
        gamification.recentActivities.unshift({
            type: 'achievement_unlocked',
            description: `¡Logro desbloqueado: ${achievement.name}!`,
            pointsEarned: achievement.bonusPoints,
            timestamp: new Date()
        });

        // Do NOT save gamification here. It will be saved after the loop in checkAndAwardAchievements.
        // await queryRunner.manager.save(gamification);
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
