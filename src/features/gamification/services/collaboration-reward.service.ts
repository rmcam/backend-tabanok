import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Badge } from "../entities/badge.entity";
import { CollaborationReward, CollaborationType } from "../entities/collaboration-reward.entity";
import { Gamification } from "../entities/gamification.entity";
import { UserReward, RewardStatus } from "../entities/user-reward.entity";
import { RewardType } from '../../../common/enums/reward.enum'; // Importar RewardType

@Injectable()
export class CollaborationRewardService {
  private readonly logger = new Logger(CollaborationRewardService.name);
  private collaborationStatsCache: Map<string, {
    totalContributions: number;
    excellentContributions: number;
    currentStreak: number;
    totalPoints: number;
  }> = new Map();

  constructor(
    @InjectRepository(CollaborationReward)
    private collaborationRewardRepository: Repository<CollaborationReward>,
    @InjectRepository(Gamification)
    private gamificationRepository: Repository<Gamification>,
    @InjectRepository(UserReward)
    private userRewardRepository: Repository<UserReward>,
  ) {}

  async awardCollaboration(
    userId: string,
    contributionId: string,
    type: CollaborationType,
    quality: string, // Cambiado a string para permitir calidades desconocidas
    reviewerId?: string
  ): Promise<void> {
    if (!Object.values(CollaborationType).includes(type)) {
      throw new BadRequestException(`Invalid collaboration type: ${type}`);
    }

    const reward = await this.collaborationRewardRepository.findOne({
      where: { type },
    });

    if (!reward) {
      throw new NotFoundException(
        `No reward configuration found for type ${type}`
      );
    }

    const gamification = await this.gamificationRepository.findOne({
      where: { userId },
    });

    if (!gamification) {
      throw new NotFoundException(
        `Gamification profile not found for user ${userId}`
      );
    }

    // Calcular puntos base con multiplicador de calidad
    const basePoints = reward.basePoints;
    // Usar 1.0 como multiplicador por defecto si la calidad no está definida
    const qualityMultiplier = reward.qualityMultipliers[quality] ?? 1.0;
    let pointsToAward = basePoints * qualityMultiplier;

    // Verificar bonificación por racha
    const userContributions = reward.history.filter((h) => h.userId === userId);
    const streakDays = this.calculateContributionStreak(userContributions);
    const streakBonus = this.calculateStreakBonus(
      streakDays,
      reward.streakBonuses
    );
    pointsToAward *= 1 + streakBonus;

    // Registrar la colaboración
    reward.history.push({
      userId,
      contributionId,
      type,
      quality,
      pointsAwarded: pointsToAward,
      awardedAt: new Date(),
      reviewedBy: reviewerId,
    });

    // Actualizar el perfil de gamificación
    gamification.points += pointsToAward;

    // Registrar actividad
    gamification.recentActivities.unshift({
      type: "collaboration",
      description: `Contribución ${type.toLowerCase()} - Calidad: ${quality}`,
      pointsEarned: pointsToAward,
      timestamp: new Date(),
    });

    // Guardar cambios
    await Promise.all([
      this.collaborationRewardRepository.save(reward),
      this.gamificationRepository.save(gamification),
    ]);

    // Invalida la caché de estadísticas del usuario
    this.clearCollaborationStatsCache(userId);
  }

  private calculateContributionStreak(
    contributions: Array<{ awardedAt: Date }>
  ): number {
    if (contributions.length === 0) return 0;

    contributions.sort((a, b) => b.awardedAt.getTime() - a.awardedAt.getTime());
    let streak = 1;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastContribution = new Date(contributions[0].awardedAt);
    lastContribution.setHours(0, 0, 0, 0);

    // Si la última contribución no fue hoy o ayer, no hay racha
    if (
      (today.getTime() - lastContribution.getTime()) / (1000 * 60 * 60 * 24) >
      1
    ) {
      return 0;
    }

    for (let i = 1; i < contributions.length; i++) {
      const current = new Date(contributions[i].awardedAt);
      current.setHours(0, 0, 0, 0);
      const previous = new Date(contributions[i - 1].awardedAt);
      previous.setHours(0, 0, 0, 0);

      const daysDiff =
        (previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24);

      if (daysDiff === 1) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  private calculateStreakBonus(
    streakDays: number,
    streakBonuses: Array<{ threshold: number; multiplier: number }>
  ): number {
    const applicableBonus = streakBonuses
      .sort((a, b) => b.threshold - a.threshold)
      .find((bonus) => streakDays >= bonus.threshold);

    return applicableBonus ? applicableBonus.multiplier : 0;
  }

  async getCollaborationStats(
    userId: string,
    type?: CollaborationType
  ): Promise<{
    totalContributions: number;
    excellentContributions: number;
    currentStreak: number;
    totalPoints: number;
  }> {
    const cacheKey = `${userId}-${type || "all"}`;
    if (this.collaborationStatsCache.has(cacheKey)) {
      this.logger.log(
        `Obteniendo estadísticas de colaboración de la caché para el usuario ${userId} y tipo ${type || "todos"}`
      );
      return this.collaborationStatsCache.get(cacheKey);
    }

    this.logger.log(
      `Calculando estadísticas de colaboración para el usuario ${userId} y tipo ${type || "todos"}`
    );

    const allRewards = await this.collaborationRewardRepository.find();

    const allUserContributions = allRewards.flatMap((r) =>
      r.history.filter((h) => h.userId === userId)
    );

    const currentStreak = this.calculateContributionStreak(allUserContributions);

    const filteredUserContributions = type
      ? allUserContributions.filter((c) => c.type === type)
      : allUserContributions;

    const totalContributions = filteredUserContributions.length;
    const excellentContributions = filteredUserContributions.filter(
      (c) => c.quality === "excellent"
    ).length;
    const totalPoints = filteredUserContributions.reduce(
      (sum, c) => sum + c.pointsAwarded,
      0
    );

    const stats = {
      totalContributions,
      excellentContributions,
      currentStreak,
      totalPoints,
    };

    this.collaborationStatsCache.set(cacheKey, stats);
    return stats;
  }

  private clearCollaborationStatsCache(userId: string): void {
    this.collaborationStatsCache.forEach((value, key) => {
      if (key.startsWith(userId)) {
        this.logger.log(
          `Invalidando la caché de estadísticas de colaboración para el usuario ${userId}`
        );
        this.collaborationStatsCache.delete(key);
      }
    });
  }
}
