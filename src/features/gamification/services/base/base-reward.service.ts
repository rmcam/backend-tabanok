import { Injectable } from '@nestjs/common';
import { User } from '../../../../auth/entities/user.entity';
import { CulturalAchievement } from '../../entities/cultural-achievement.entity';

@Injectable()
export abstract class BaseRewardService {
  abstract calculateReward(
    user: User,
    action: string,
    metadata?: any,
  ): Promise<CulturalAchievement>;
  abstract validateRequirements(user: User, achievement: CulturalAchievement): Promise<boolean>;

  protected async updateUserStats(user: User, achievement: CulturalAchievement): Promise<void> {
    user.culturalPoints += achievement.pointsReward || 0;
  }

  protected getRewardExpiration(achievement: CulturalAchievement): Date | null {
    if (!achievement.expirationDays || achievement.expirationDays <= 0) {
      return null;
    }
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + achievement.expirationDays);
    return expirationDate;
  }

  protected validateRewardCriteria(user: User, requirements: any): boolean {
    if (!requirements) return true;

    const { minLevel, requiredAchievements } = requirements;

    if (minLevel && user.level < minLevel) return false;
    if (requiredAchievements?.length > 0) {
      const userAchievementIds = user.userAchievements?.map(ua => ua.achievementId) || [];
      if (!requiredAchievements.every(id => userAchievementIds.includes(id))) {
        return false;
      }
    }

    return true;
  }
}
