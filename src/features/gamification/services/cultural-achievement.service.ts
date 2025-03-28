import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../auth/entities/user.entity';
import { AchievementProgress } from '../entities/achievement-progress.entity';
import { AchievementCategory, AchievementTier, CulturalAchievement } from '../entities/cultural-achievement.entity';

@Injectable()
export class CulturalAchievementService {
    constructor(
        @InjectRepository(CulturalAchievement)
        private achievementRepository: Repository<CulturalAchievement>,
        @InjectRepository(AchievementProgress)
        private progressRepository: Repository<AchievementProgress>,
        @InjectRepository(User)
        private userRepository: Repository<User>
    ) { }

    async createAchievement(data: {
        name: string;
        description: string;
        category: AchievementCategory;
        tier: AchievementTier;
        requirements: { type: string; value: number; description: string }[];
        pointsReward: number;
        additionalRewards?: { type: string; value: any; description: string }[];
        imageUrl?: string;
        isSecret?: boolean;
    }): Promise<CulturalAchievement> {
        const achievement = this.achievementRepository.create(data);
        return this.achievementRepository.save(achievement);
    }

    async getAchievements(category?: AchievementCategory): Promise<CulturalAchievement[]> {
        const query = this.achievementRepository.createQueryBuilder('achievement')
            .where('achievement.isActive = :isActive', { isActive: true });

        if (category) {
            query.andWhere('achievement.category = :category', { category });
        }

        return query.getMany();
    }

    async initializeUserProgress(userId: string, achievementId: string): Promise<AchievementProgress> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        const achievement = await this.achievementRepository.findOne({ where: { id: achievementId } });
        if (!achievement) {
            throw new NotFoundException('Logro no encontrado');
        }

        // Verificar si ya existe un progreso
        const existingProgress = await this.progressRepository.findOne({
            where: {
                user: { id: userId },
                achievement: { id: achievementId }
            }
        });

        if (existingProgress) {
            throw new BadRequestException('El progreso ya está inicializado para este logro');
        }

        const progress = this.progressRepository.create({
            user,
            achievement,
            progress: achievement.requirements.map(req => ({
                requirementType: req.type,
                currentValue: 0,
                targetValue: req.value,
                lastUpdated: new Date()
            })),
            percentageCompleted: 0,
            isCompleted: false,
            milestones: []
        });

        return this.progressRepository.save(progress);
    }

    async updateProgress(
        userId: string,
        achievementId: string,
        updates: { type: string; value: number }[]
    ): Promise<AchievementProgress> {
        const progress = await this.progressRepository.findOne({
            where: {
                user: { id: userId },
                achievement: { id: achievementId }
            },
            relations: ['achievement']
        });

        if (!progress) {
            throw new NotFoundException('Progreso no encontrado');
        }

        if (progress.isCompleted) {
            throw new BadRequestException('Este logro ya está completado');
        }

        // Actualizar progreso
        for (const update of updates) {
            const requirement = progress.progress.find(p => p.requirementType === update.type);
            if (requirement) {
                requirement.currentValue = Math.min(
                    requirement.currentValue + update.value,
                    requirement.targetValue
                );
                requirement.lastUpdated = new Date();
            }
        }

        // Calcular porcentaje total
        const totalPercentage = progress.progress.reduce((acc, curr) => {
            return acc + (curr.currentValue / curr.targetValue);
        }, 0) / progress.progress.length * 100;

        progress.percentageCompleted = Math.min(totalPercentage, 100);

        // Verificar si se completó el logro
        if (progress.percentageCompleted === 100) {
            progress.isCompleted = true;
            progress.completedAt = new Date();
            await this.awardAchievement(userId, progress.achievement);
        }

        return this.progressRepository.save(progress);
    }

    private async awardAchievement(userId: string, achievement: CulturalAchievement): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: ['achievements']
        });

        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // Agregar el logro al usuario
        user.achievements = user.achievements || [];
        user.achievements.push(achievement);

        // Otorgar puntos y recompensas adicionales
        user.culturalPoints = (user.culturalPoints || 0) + achievement.pointsReward;

        await this.userRepository.save(user);
    }

    async getUserAchievements(userId: string): Promise<{
        completed: CulturalAchievement[];
        inProgress: { achievement: CulturalAchievement; progress: AchievementProgress }[];
    }> {
        const progresses = await this.progressRepository.find({
            where: { user: { id: userId } },
            relations: ['achievement']
        });

        return {
            completed: progresses
                .filter(p => p.isCompleted)
                .map(p => p.achievement),
            inProgress: progresses
                .filter(p => !p.isCompleted)
                .map(p => ({ achievement: p.achievement, progress: p }))
        };
    }

    async getAchievementProgress(userId: string, achievementId: string): Promise<AchievementProgress> {
        const progress = await this.progressRepository.findOne({
            where: {
                user: { id: userId },
                achievement: { id: achievementId }
            },
            relations: ['achievement']
        });

        if (!progress) {
            throw new NotFoundException('Progreso no encontrado');
        }

        return progress;
    }
} 