import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CulturalAchievement, AchievementCategory, AchievementType, AchievementTier } from '../entities/cultural-achievement.entity';
import { AchievementProgress } from '../entities/achievement-progress.entity';
import { User } from '../../../auth/entities/user.entity';

@Injectable()
export class CulturalAchievementService {
  constructor(
    @InjectRepository(CulturalAchievement)
    private readonly culturalAchievementRepository: Repository<CulturalAchievement>,
    @InjectRepository(AchievementProgress)
    private readonly achievementProgressRepository: Repository<AchievementProgress>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createAchievement(
    name: string,
    description: string,
    category: AchievementCategory,
    type: AchievementType,
    tier: AchievementTier,
    requirements: { type: string; value: number; description: string; }[],
    pointsReward: number,
  ): Promise<CulturalAchievement> {
    const achievement = this.culturalAchievementRepository.create();
    achievement.name = name;
    achievement.description = description;
    achievement.category = category;
    achievement.type = type;
    achievement.tier = tier;
    achievement.requirements = requirements;
    achievement.pointsReward = pointsReward;
    return this.culturalAchievementRepository.save(achievement);
  }

  async getAchievements(category?: AchievementCategory, type?: AchievementType): Promise<CulturalAchievement[]> {
    const where: any = {};
    if (category) {
      where.category = category;
    }
    if (type) {
      where.type = type;
    }
    return this.culturalAchievementRepository.find({ where });
  }

  async initializeUserProgress(userId: number, achievementId: number): Promise<AchievementProgress> {
    const user = await this.userRepository.findOne({ where: { id: userId.toString() } });
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const achievement = await this.culturalAchievementRepository.findOne({ where: { id: achievementId.toString() } });
    if (!achievement) {
      throw new Error(`CulturalAchievement with ID ${achievementId} not found`);
    }

    const progress = this.achievementProgressRepository.create();
    progress.user = user;
    progress.achievement = achievement;
    progress.progress = [];
    progress.percentageCompleted = 0;
    return this.achievementProgressRepository.save(progress);
  }

  async updateProgress(
    userId: number,
    achievementId: number,
    progressUpdates: any[],
  ): Promise<AchievementProgress> {
    const user = await this.userRepository.findOne({ where: { id: userId.toString() } });
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const achievement = await this.culturalAchievementRepository.findOne({ where: { id: achievementId.toString() } });
    if (!achievement) {
      throw new Error(`CulturalAchievement with ID ${achievementId} not found`);
    }

    const progress = await this.achievementProgressRepository.findOne({
      where: {
        user: { id: userId.toString() },
        achievement: { id: achievementId.toString() },
      },
    });

    if (!progress) {
      throw new Error(
        `AchievementProgress not found for user ID ${userId} and achievement ID ${achievementId}`,
      );
    }

    // Lógica para actualizar el progreso del usuario
    progress.progress = progressUpdates;
    progress.percentageCompleted = this.calculatePercentageCompleted(progressUpdates);

    return this.achievementProgressRepository.save(progress);
  }

  calculatePercentageCompleted(progressUpdates: any[]): number {
    let totalProgress = 0;
    for (const update of progressUpdates) {
      totalProgress += update.currentValue / update.targetValue;
    }
    return totalProgress / progressUpdates.length;
  }

  async getUserAchievements(userId: number): Promise<{ completed: CulturalAchievement[]; inProgress: CulturalAchievement[] }> {
    const user = await this.userRepository.findOne({ where: { id: userId.toString() } });
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const completedProgress = await this.achievementProgressRepository.find({
      where: {
        user: { id: userId.toString() },
        isCompleted: true,
      },
      relations: ['achievement'],
    });

    const inProgressProgress = await this.achievementProgressRepository.find({
      where: {
        user: { id: userId.toString() },
        isCompleted: false,
      },
      relations: ['achievement'],
    });

    const completed = completedProgress.map((progress) => progress.achievement);
    const inProgress = inProgressProgress.map((progress) => progress.achievement);

    return { completed, inProgress };
  }

  async getAchievementProgress(userId: number, achievementId: number): Promise<AchievementProgress | undefined> {
    const user = await this.userRepository.findOne({ where: { id: userId.toString() } });
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const achievementProgress = await this.achievementProgressRepository.findOne({
      where: {
        user: { id: userId.toString() },
        achievement: { id: achievementId.toString() },
      },
    });

    return achievementProgress;
  }
}
