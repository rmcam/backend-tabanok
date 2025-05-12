import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';

import { calculateLevel } from '@/lib/gamification';
import { Achievement } from '../entities/achievement.entity';
import { UserActivity } from '@/features/activity/entities/user-activity.entity';
import { Mission } from '../entities/mission.entity';
import { Reward } from '../entities/reward.entity';
import { UserAchievement } from '../entities/user-achievement.entity';
import { UserMission } from '../entities/user-mission.entity';
import { UserReward } from '../entities/user-reward.entity';
import { UserLevel } from '../entities/user-level.entity';
import { User } from '@/auth/entities/user.entity';

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
    @InjectRepository(UserLevel)
    private userLevelRepository: Repository<UserLevel>,
    private dataSource: DataSource,
  ) {}

  private async findUser(userId: number | string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId.toString() } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }
    return user;
  }

  async updateStats(userId: number | string, stats: any): Promise<UserLevel> {
    const user = await this.findUser(userId);

    // Find or create UserLevel entity
    let userLevel = await this.userLevelRepository.findOne({ where: { user: { id: user.id } } });
    if (!userLevel) {
      userLevel = this.userLevelRepository.create({ user: user });
    }

    // Update UserLevel stats based on the 'stats' object
    // Assuming 'stats' might contain updates for level, points, experience, etc.
    if (stats.level !== undefined) {
      userLevel.level = stats.level;
    }
    if (stats.points !== undefined) {
      userLevel.points = stats.points;
    }
    if (stats.experience !== undefined) {
      userLevel.experience = stats.experience;
    }
    // Add other fields from UserLevel entity as needed based on the structure of 'stats'
    // For now, assuming stats might directly provide updates for these fields.

    // Save UserLevel entity
    await this.userLevelRepository.save(userLevel);

    return userLevel; // Return the updated UserLevel entity
  }

  async getUserStats(userId: number | string): Promise<UserLevel> {
    const userLevel = await this.userLevelRepository.findOne({ where: { user: { id: userId.toString() } }, relations: ['user'] });
    if (!userLevel) {
      throw new NotFoundException(`UserLevel for user with ID ${userId} not found`);
    }
    // Ensure level is updated before returning UserLevel (optional, as it's updated in awardPoints/addPoints)
    // userLevel.level = calculateLevel(userLevel.points);
    return userLevel;
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, { where: { id: userId.toString() } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const achievement = await queryRunner.manager.findOne(Achievement, { where: { id: achievementId.toString() } });
      if (!achievement) {
        throw new NotFoundException(`Achievement with ID ${achievementId} not found`);
      }

      // Usar el manager del queryRunner para crear y guardar la relación
      const newRelation = queryRunner.manager.create(UserAchievement, {
        user: user,
        userId: user.id,
        achievement: achievement,
        achievementId: achievement.id,
        dateAwarded: new Date(),
      });

      await queryRunner.manager.save(newRelation);

      // Si es necesario actualizar el usuario (por ejemplo, añadir un logro a una lista en el usuario)
      // await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();
      return user; // O la entidad UserAchievement creada, dependiendo del retorno esperado
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async grantBadge(userId: number | string, badgeId: number | string): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, { where: { id: userId.toString() } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const badge = await queryRunner.manager.findOne(Reward, { where: { id: badgeId.toString() } });
      if (!badge) {
        throw new NotFoundException(`Reward with ID ${badgeId} not found`);
      }

      // Usar el manager del queryRunner para crear y guardar la relación
      const newRelation = queryRunner.manager.create(UserReward, {
        user: user,
        userId: user.id,
        reward: badge, // Usar 'reward' ya que es una UserReward
        rewardId: badge.id,
        dateAwarded: new Date(),
      });

      await queryRunner.manager.save(newRelation);

      // Si es necesario actualizar el usuario
      // await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();
      return user; // O la entidad UserReward creada
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async assignMission(userId: number | string, missionId: number | string): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, { where: { id: userId.toString() } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      const mission = await queryRunner.manager.findOne(Mission, { where: { id: missionId.toString() } });
      if (!mission) {
        throw new NotFoundException(`Mission with ID ${missionId} not found`);
      }

      // Usar el manager del queryRunner para crear y guardar la relación
      const newRelation = queryRunner.manager.create(UserMission, {
        user: user,
        userId: user.id,
        mission: mission,
        missionId: mission.id,
      });

      await queryRunner.manager.save(newRelation);

      // Si es necesario actualizar el usuario
      // await queryRunner.manager.save(user);

      await queryRunner.commitTransaction();
      return user; // O la entidad UserMission creada
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async awardPoints(
    userId: number | string,
    points: number,
    activityType: string,
    description: string,
  ): Promise<UserLevel> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, { where: { id: userId.toString() } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Find or create UserLevel entity using the query runner's manager
      let userLevel = await queryRunner.manager.findOne(UserLevel, { where: { user: { id: user.id } } });
      if (!userLevel) {
        userLevel = queryRunner.manager.create(UserLevel, { user: user });
      }

      // Update UserLevel stats
      userLevel.points += points; // Update points in UserLevel
      userLevel.experience += points; // Assuming experience is also gained with points

      const activity = queryRunner.manager.create(UserActivity, {
        type: activityType,
        description: description,
        user: user,
      } as any);

      await queryRunner.manager.save(activity);

      // Actualizar nivel basado en los nuevos puntos (using points from UserLevel)
      const newLevel = calculateLevel(userLevel.points);
      userLevel.level = newLevel; // Update level in UserLevel

      // Save UserLevel entity using the query runner's manager
      await queryRunner.manager.save(userLevel);

      await queryRunner.commitTransaction();
      return userLevel; // Return the updated UserLevel entity
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Añade puntos directamente a un usuario y actualiza su nivel.
   * Este método puede ser útil para ajustes manuales o eventos especiales no ligados a actividades específicas.
   * @param userId ID del usuario.
   * @param points Cantidad de puntos a añadir.
   * @returns Usuario actualizado.
   */
  async addPoints(userId: number | string, points: number): Promise<UserLevel> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, { where: { id: userId.toString() } });
      if (!user) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      // Find or create UserLevel entity using the query runner's manager
      let userLevel = await queryRunner.manager.findOne(UserLevel, { where: { user: { id: user.id } } });
      if (!userLevel) {
        userLevel = queryRunner.manager.create(UserLevel, { user: user });
      }

      // Update UserLevel stats
      userLevel.points += points; // Update points in UserLevel
      userLevel.experience += points; // Assuming experience is also gained with points

      // Recalcular nivel después de añadir puntos (using points from UserLevel)
      const newLevel = calculateLevel(userLevel.points);
      userLevel.level = newLevel; // Update level in UserLevel

      // Save UserLevel entity using the query runner's manager
      await queryRunner.manager.save(userLevel);

      // Aquí se podrían añadir otras operaciones de base de datos
      // que necesiten ser parte de la misma transacción.

      await queryRunner.commitTransaction();
      return userLevel; // Return the updated UserLevel entity
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }


  async getRewards(): Promise<Reward[]> {
    return this.rewardRepository.find();
  }

  async findByUserId(userId: number | string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { id: userId.toString() } });
  }
}
