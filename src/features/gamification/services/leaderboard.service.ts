import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../auth/entities/user.entity';
import { UserAchievement } from '../entities/user-achievement.entity';
import { UserMission } from '../entities/user-mission.entity';
import { UserReward } from '../entities/user-reward.entity';
import { Gamification } from '../entities/gamification.entity';
import { GamificationRepository } from '../repositories/gamification.repository';

interface LeaderboardEntry {
  userId: string;
  username: string;
  score: number;
  rank: number;
}

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserAchievement)
    private userAchievementRepository: Repository<UserAchievement>,
    @InjectRepository(UserMission) private userMissionRepository: Repository<UserMission>,
    @InjectRepository(UserReward) private userRewardRepository: Repository<UserReward>,
    private gamificationRepository: GamificationRepository,
  ) {}

  async getLeaderboard(): Promise<LeaderboardEntry[]> {
    try {
      const users = await this.userRepository.find();
      const leaderboardEntries: LeaderboardEntry[] = [];

      for (const user of users) {
        const gamification = await this.gamificationRepository.findOne(user.id); // Usar GamificationRepository

        const completedAchievementsCount = await this.userAchievementRepository.count({
          where: { user: { id: user.id } },
        });
        const completedMissionsCount = await this.userMissionRepository.count({
          where: { user: { id: user.id } },
        });
        const rewardsCount = await this.userRewardRepository.count({
          where: { user: { id: user.id } },
        });

        let score = 0;

        if (gamification) {
          score += gamification.level * 100; // Usar level de Gamification
          score += gamification.experience; // Usar experience de Gamification
        } else {
          console.warn(`Gamification profile not found for user ${user.id}`);
        }

        score += completedAchievementsCount * 50;
        score += completedMissionsCount * 25;
        score += rewardsCount * 10;

        leaderboardEntries.push({
          userId: user.id,
          username: user.username,
          score: score,
          rank: 0, // Rank will be calculated later
        });
      }

      // Sort the leaderboard entries by score in descending order
      leaderboardEntries.sort((a, b) => b.score - a.score);

      // Calculate the rank for each entry
      let rank = 1;
      for (const entry of leaderboardEntries) {
        entry.rank = rank++;
      }

      return leaderboardEntries;
    } catch (error) {
      console.error('Error al obtener la tabla de clasificación:', error);
      throw error;
    }
  }

  async getUserRank(userId: string): Promise<number> {
    const leaderboard = await this.getLeaderboard();
    const userEntry = leaderboard.find((entry) => entry.userId === userId);

    if (!userEntry) {
      return 0; // User not found in leaderboard
    }

    return userEntry.rank;
  }
}
