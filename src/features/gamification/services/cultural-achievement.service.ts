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

  async initializeUserProgress(userId: string, achievementId: string): Promise<AchievementProgress> {
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
    userId: string,
    achievementId: string,
    progressUpdates: any[],
  ): Promise<AchievementProgress> {
    const user = await this.userRepository.findOne({ where: { id: userId.toString() } });
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const achievement = await this.culturalAchievementRepository.findOne({ where: { id: achievementId } });
    if (!achievement) {
      throw new Error(`CulturalAchievement with ID ${achievementId} not found`);
    }

    const progress = await this.achievementProgressRepository.findOne({
      where: {
        user: { id: userId },
        achievement: { id: achievementId },
      },
    });

    if (!progress) {
      throw new Error(
        `AchievementProgress not found for user ID ${userId} and achievement ID ${achievementId}`,
      );
    }

    // Lógica para actualizar el progreso del usuario
    // Update existing progress entries or add new ones
    progressUpdates.forEach(update => {
      const existingRequirement = progress.progress.find(req => req.requirementType === update.requirementType);
      if (existingRequirement) {
        existingRequirement.currentValue = update.currentValue;
        existingRequirement.lastUpdated = new Date(); // Update timestamp
      } else {
        // Add new requirement if it doesn't exist (shouldn't happen with current test structure, but good practice)
        progress.progress.push({ ...update, lastUpdated: new Date() });
      }
    });

    progress.percentageCompleted = this.calculatePercentageCompleted(progress.progress); // Calculate based on the updated progress array

    // Check if the achievement is completed after updating progress
    if (progress.percentageCompleted === 100 && !progress.isCompleted) {
      progress.isCompleted = true;
      // Award points to the user
      const userToUpdate = await this.userRepository.findOne({ where: { id: userId.toString() } });
      if (userToUpdate && achievement.pointsReward > 0) {
        userToUpdate.points += achievement.pointsReward;
        await this.userRepository.save(userToUpdate);
      }
    }

    return this.achievementProgressRepository.save(progress);
  }

  calculatePercentageCompleted(progressEntries: any[]): number {
    // Check if all requirements are met
    const allRequirementsMet = progressEntries.every(entry => entry.currentValue >= entry.targetValue);

    // Return 100% if all requirements are met, otherwise 0%
    return allRequirementsMet ? 100 : 0;
  }

  async getUserAchievements(userId: string): Promise<{ completed: CulturalAchievement[]; inProgress: CulturalAchievement[] }> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
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

  async getAchievementProgress(userId: string, achievementId: string): Promise<AchievementProgress | undefined> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    const achievementProgress = await this.achievementProgressRepository.findOne({
      where: {
        user: { id: userId },
        achievement: { id: achievementId },
      },
    });

    return achievementProgress;
  }
}
