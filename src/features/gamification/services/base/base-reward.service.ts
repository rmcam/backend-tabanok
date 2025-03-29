import { Injectable } from '@nestjs/common';
import { Reward, RewardType } from '../../../reward/entities/reward.entity';
import { User } from '../../../user/entities/user.entity';

@Injectable()
export abstract class BaseRewardService {
    abstract calculateReward(user: User, action: string, metadata?: any): Promise<Reward>;
    abstract validateRequirements(user: User, reward: Reward): Promise<boolean>;

    protected async updateUserStats(user: User, reward: Reward): Promise<void> {
        user.points += reward.points || 0;
        if (reward.type === RewardType.CULTURAL_ITEM) {
            user.culturalPoints += reward.points || 0;
        }
    }

    protected getRewardExpiration(reward: Reward): Date | null {
        if (!reward.expirationDays) {
            return null;
        }
        const expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + reward.expirationDays);
        return expirationDate;
    }

    protected validateRewardCriteria(user: User, criteria: any): boolean {
        if (!criteria) return true;

        const { minLevel, minPoints, requiredAchievements } = criteria;

        if (minLevel && user.level < minLevel) return false;
        if (minPoints && user.points < minPoints) return false;
        if (requiredAchievements?.length > 0) {
            const userAchievementIds = user.userAchievements?.map(ua => ua.achievementId) || [];
            if (!requiredAchievements.every(id => userAchievementIds.includes(id))) {
                return false;
            }
        }

        return true;
    }
} 