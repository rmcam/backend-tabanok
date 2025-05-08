import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/auth/entities/user.entity';
import { calculateLevel } from '@/lib/gamification';
import { Achievement } from '../entities/achievement.entity';
import { UserActivity } from '@/features/activity/entities/user-activity.entity';
import { Mission } from '../entities/mission.entity';
import { Reward } from '../entities/reward.entity';
import { UserAchievement } from '../entities/user-achievement.entity';
import { UserMission } from '../entities/user-mission.entity';
import { UserReward } from '../entities/user-reward.entity';
import { UserLevel } from '../entities/user-level.entity'; // Importar UserLevel

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
    @InjectRepository(UserReward)
    private userRewardRepository: Repository<UserReward>,
    @InjectRepository(UserLevel) // Inyectar UserLevelRepository
    private userLevelRepository: Repository<UserLevel>,
  ) {}

  private async findUser(userId: number | string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId.toString() } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  async updateStats(userId: number | string, stats: any): Promise<User> {
    const user = await this.findUser(userId);
    // Assuming 'stats' is an object with properties to update in user.gameStats
    user.gameStats = { ...user.gameStats, ...stats };
    return this.userRepository.save(user);
  }

  async getUserStats(userId: number | string): Promise<User> {
    const user = await this.findUser(userId);
    // Asegurarse de que el nivel esté actualizado antes de devolver el usuario
    user.gameStats.level = calculateLevel(user.gameStats.totalPoints);
    return user;
  }

  private async createUserGamificationRelation(
    user: User,
    gamificationEntity: any, // Puede ser Achievement, Reward, Mission
    relationRepository: any, // Usar any para el repositorio
    relationEntityConstructor: any, // Usar any para el constructor
    additionalProps: any = {} // Usar any para propiedades adicionales
  ): Promise<any> { // Usar any para el tipo de retorno
    const newRelation = relationRepository.create({
      user: user,
      userId: user.id, // Asignar userId explícitamente
      ...additionalProps,
    });

    // Asignar la entidad de gamificación según el tipo
    if (gamificationEntity instanceof Achievement) {
      newRelation.achievement = gamificationEntity;
      newRelation.achievementId = gamificationEntity.id; // Asignar achievementId
    } else if (gamificationEntity instanceof Reward) {
      newRelation.reward = gamificationEntity;
      newRelation.rewardId = gamificationEntity.id; // Asignar rewardId
    } else if (gamificationEntity instanceof Mission) {
      newRelation.mission = gamificationEntity;
      newRelation.missionId = gamificationEntity.id; // Asignar missionId
    }


    await relationRepository.save(newRelation);
    return newRelation;
  }

  async grantAchievement(userId: number | string, achievementId: number | string): Promise<User> {
    const user = await this.findUser(userId);

    const achievement = await this.achievementRepository.findOne({ where: { id: achievementId.toString() } });
    if (!achievement) {
      throw new NotFoundException(`Achievement with ID ${achievementId} not found`);
    }

    await this.createUserGamificationRelation(user, achievement, this.userAchievementRepository, UserAchievement, { dateAwarded: new Date() });

    return this.userRepository.save(user);
  }

  async grantBadge(userId: number | string, badgeId: number | string): Promise<User> {
    const user = await this.findUser(userId);

    const badge = await this.rewardRepository.findOne({ where: { id: badgeId.toString() } });
    if (!badge) {
      throw new NotFoundException(`Reward with ID ${badgeId} not found`);
    }

    await this.createUserGamificationRelation(user, badge, this.userRewardRepository, UserReward, { dateAwarded: new Date() });

    return this.userRepository.save(user);
  }

  async assignMission(userId: number | string, missionId: number | string): Promise<User> {
    const user = await this.findUser(userId);

    const mission = await this.missionRepository.findOne({ where: { id: missionId.toString() } });
    if (!mission) {
      throw new NotFoundException(`Mission with ID ${missionId} not found`);
    }

    await this.createUserGamificationRelation(user, mission, this.userMissionRepository, UserMission);

    return this.userRepository.save(user);
  }

  async awardPoints(
    userId: number | string,
    points: number,
    activityType: string,
    description: string,
  ): Promise<User> {
    const user = await this.findUser(userId);

    user.gameStats.totalPoints += points;

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
    } else if (activityType === 'perfect-score') {
       user.gameStats.perfectScores += 1;
    }

    // Actualizar nivel basado en los nuevos puntos
    user.gameStats.level = calculateLevel(user.gameStats.totalPoints);

    return this.userRepository.save(user);
  }

  // Método para añadir puntos directamente (usado en pruebas)
  async addPoints(userId: number | string, points: number): Promise<User> {
    const user = await this.findUser(userId);
    user.gameStats.totalPoints += points;
    // Recalcular nivel después de añadir puntos
    user.gameStats.level = calculateLevel(user.gameStats.totalPoints);
    return this.userRepository.save(user);
  }

  // Método para crear una entrada UserLevel para un usuario (usado en pruebas)
  async createUserLevel(user: User): Promise<any> { // Usar any para el tipo de retorno por ahora
    const newUserLevel = this.userLevelRepository.create({
      user: user,
      // Eliminar userId aquí, ya que la relación se maneja a través de la propiedad 'user'
    });
    await this.userLevelRepository.save(newUserLevel);
    return newUserLevel;
  }


  async getRewards(): Promise<Reward[]> {
    return this.rewardRepository.find();
  }

  async findByUserId(userId: number | string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { id: userId.toString() } });
  }
}
