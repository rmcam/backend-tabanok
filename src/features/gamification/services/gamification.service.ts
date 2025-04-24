import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../auth/entities/user.entity';
import { calculateLevel } from '../../../lib/gamification';
import { Achievement } from '../entities/achievement.entity';
import { UserActivity } from '../entities/activity.entity';
import { Mission } from '../entities/mission.entity';
import { Reward } from '../entities/reward.entity';
import { UserAchievement } from '../entities/user-achievement.entity';
import { UserLevel } from '../entities/user-level.entity';
import { UserMission } from '../entities/user-mission.entity';
import { UserReward } from '../entities/user-reward.entity';

@Injectable()
export class GamificationService {
  constructor(
    @InjectRepository(UserActivity)
    private readonly activityRepository: Repository<UserActivity>,
    @InjectRepository(Reward)
    private rewardRepository: Repository<Reward>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
    @InjectRepository(UserAchievement)
    private userAchievementRepository: Repository<UserAchievement>,
    @InjectRepository(Mission)
    private missionRepository: Repository<Mission>,
    @InjectRepository(UserMission)
    private userMissionRepository: Repository<UserMission>,
    @InjectRepository(UserLevel)
    private userLevelRepository: Repository<UserLevel>,
    @InjectRepository(UserReward)
    private userRewardRepository: Repository<UserReward>,
  ) {}

  private async findUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId.toString() } });
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    return user;
  }

  async grantBadge(userId: number, badgeId: number): Promise<User> {
    const user = await this.findUser(userId);

    const reward = await this.rewardRepository.findOne({ where: { id: badgeId.toString() } });
    if (!reward) {
      throw new Error(`Reward with ID ${badgeId} not found`);
    }

    const newUserReward = new UserReward();
    newUserReward.userId = user.id;
    newUserReward.rewardId = reward.id;
    newUserReward.dateAwarded = new Date();

    await this.userRewardRepository.save(newUserReward);

    return this.userRepository.save(user);
  }

  async createUserLevel(user: User): Promise<UserLevel> {
    const newUserLevel = this.userLevelRepository.create({
      user,
      userId: user.id,
    });
    return this.userLevelRepository.save(newUserLevel);
  }

  async getRewards(): Promise<Reward[]> {
    return this.rewardRepository.find();
  }

  async grantPoints(userId: number, points: number): Promise<User> {
    const user = await this.findUser(userId);
    user.points += points;
    return this.userRepository.save(user);
  }

  async findByUserId(userId: number): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { id: userId.toString() } });
  }

  async addPoints(userId: number, points: number): Promise<User> {
    const user = await this.findUser(userId);
    return this.userRepository.save(user);
  }

  async updateStats(userId: number, stats: any): Promise<User> {
    const user = await this.findUser(userId);
    return this.userRepository.save(user);
  }

  async getUserStats(userId: number): Promise<any> {
    const user = await this.findUser(userId);
    return {
      level: calculateLevel(user.points),
    };
  }

  async grantAchievement(userId: number, achievementId: number): Promise<User> {
    const user = await this.findUser(userId);

    const achievement = await this.achievementRepository.findOne({ where: { id: achievementId.toString() } });
    if (!achievement) {
      throw new Error(`Achievement with ID ${achievementId} not found`);
    }

    const newUserAchievement = new UserAchievement();
    newUserAchievement.userId = user.id;
    newUserAchievement.achievementId = achievement.id;
    newUserAchievement.dateAwarded = new Date();

    await this.userAchievementRepository.save(newUserAchievement);

    return this.userRepository.save(user);
  }

  async awardReward(userId: number, rewardId: number): Promise<User> {
    const user = await this.findUser(userId);

    const reward = await this.rewardRepository.findOne({ where: { id: rewardId.toString() } });
    if (!reward) {
      throw new Error(`Reward with ID ${rewardId} not found`);
    }

    const newUserReward = new UserReward();
    newUserReward.userId = user.id;
    newUserReward.rewardId = reward.id;
    newUserReward.dateAwarded = new Date();

    await this.userRewardRepository.save(newUserReward);

    return this.userRepository.save(user);
  }

  async assignMission(userId: number, missionId: number): Promise<User> {
    const user = await this.findUser(userId);

    const mission = await this.missionRepository.findOne({ where: { id: missionId.toString() } });
    if (!mission) {
      throw new Error(`Mission with ID ${missionId} not found`);
    }

    const newUserMission = this.userMissionRepository.create({
      user: user,
      mission: mission,
    });

    await this.userMissionRepository.save(newUserMission);

    return this.userRepository.save(user);
  }

  async awardPoints(
    userId: number,
    points: number,
    activityType: string,
    description: string,
  ): Promise<User> {
    const user = await this.findUser(userId);

    user.points += points;

    const activity = this.activityRepository.create({
      type: activityType,
      description: description,
      user: user,
    } as any);

    await this.activityRepository.save(activity);

    // Actualizar estadísticas del usuario según el tipo de actividad
    if (activityType === 'lesson') {
      user.gameStats.lessonsCompleted += 1;
    } else if (activityType === 'exercise') {
      user.gameStats.exercisesCompleted += 1;
    }

    return this.userRepository.save(user);
  }
}
