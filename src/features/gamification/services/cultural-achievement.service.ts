import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../auth/entities/user.entity'; // Ruta corregida
import {
  NotificationPriority,
  NotificationType,
} from '../../notifications/entities/notification.entity';
import { NotificationService } from '../../notifications/services/notification.service';
import { AchievementProgress } from '../entities/achievement-progress.entity';
import {
  AchievementCategory,
  AchievementTier,
  CulturalAchievement,
} from '../entities/cultural-achievement.entity';

@Injectable()
export class CulturalAchievementService {
  constructor(
    @InjectRepository(CulturalAchievement)
    private achievementRepository: Repository<CulturalAchievement>,
    @InjectRepository(AchievementProgress)
    private progressRepository: Repository<AchievementProgress>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private notificationService: NotificationService,
  ) {}

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

  async getAchievements(
    category?: AchievementCategory,
  ): Promise<CulturalAchievement[]> {
    const query = this.achievementRepository
      .createQueryBuilder('achievement')
      .where('achievement.isActive = :isActive', { isActive: true });

    if (category) {
      query.andWhere('achievement.category = :category', { category });
    }

    return query.getMany();
  }

  async initializeUserProgress(
    userId: string,
    achievementId: string,
  ): Promise<AchievementProgress> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const achievement = await this.achievementRepository.findOne({
      where: { id: achievementId },
    });
    if (!achievement) {
      throw new NotFoundException('Logro no encontrado');
    }

    // Verificar si ya existe un progreso
    const existingProgress = await this.progressRepository.findOne({
      where: {
        user: { id: userId },
        achievement: { id: achievementId },
      },
    });

    if (existingProgress) {
      throw new BadRequestException(
        'El progreso ya está inicializado para este logro',
      );
    }

    const progress = this.progressRepository.create({
      user,
      achievement,
      progress: achievement.requirements.map((req) => ({
        requirementType: req.type,
        currentValue: 0,
        targetValue: req.value,
        lastUpdated: new Date(),
      })),
      percentageCompleted: 0,
      isCompleted: false,
      milestones: [],
    });

    return this.progressRepository.save(progress);
  }

  async updateProgress(
    userId: string,
    achievementId: string,
    updates: { type: string; value: number }[],
  ): Promise<AchievementProgress> {
    const progress = await this.progressRepository.findOne({
      where: { user: { id: userId }, achievement: { id: achievementId } },
      relations: ['achievement', 'user'],
    });

    if (!progress) {
      throw new NotFoundException('Progreso no encontrado');
    }

    if (progress.isCompleted) {
      throw new BadRequestException('Este logro ya está completado');
    }

    // Actualizar el progreso
    let totalPercentage = 0;
    let requirementsCompleted = 0;

    for (const requirement of progress.progress) {
      const update = updates.find(
        (u) => u.type === requirement.requirementType,
      );
      if (update) {
        requirement.currentValue = Math.min(
          requirement.targetValue,
          requirement.currentValue + update.value,
        );
      }

      const requirementPercentage =
        (requirement.currentValue / requirement.targetValue) * 100;
      totalPercentage += requirementPercentage;

      if (requirement.currentValue >= requirement.targetValue) {
        requirementsCompleted++;
      }
    }

    // Calcular el porcentaje total
    progress.percentageCompleted = Math.floor(
      totalPercentage / progress.progress.length,
    );

    // Verificar hitos
    const previousMilestones = progress.milestones.filter(
      (m) => m.isAchieved,
    ).length;
    for (const milestone of progress.milestones) {
      if (
        !milestone.isAchieved &&
        progress.percentageCompleted >= milestone.value
      ) {
        milestone.isAchieved = true;
      }
    }
    const newMilestones = progress.milestones.filter(
      (m) => m.isAchieved,
    ).length;

    // Si se alcanzaron nuevos hitos, notificar
    if (newMilestones > previousMilestones) {
      await this.notificationService.createNotification({
        userId,
        type: NotificationType.ACHIEVEMENT_UNLOCKED,
        title: '¡Nuevo Hito Alcanzado!',
        message: `Has alcanzado un nuevo hito en el logro: ${progress.achievement.name}`,
        priority: NotificationPriority.MEDIUM,
        metadata: {
          achievementId,
          percentageCompleted: progress.percentageCompleted,
        },
      });
    }

    // Verificar si el logro se completó
    if (
      requirementsCompleted === progress.progress.length &&
      !progress.isCompleted
    ) {
      progress.isCompleted = true;
      progress.completedAt = new Date();

      // Notificar la completación del logro
      await this.notificationService.notifyAchievementUnlocked(
        userId,
        progress.achievement.name,
        achievementId,
      );
    }

    return this.progressRepository.save(progress);
  }

  private async awardAchievement(
    userId: string,
    achievement: CulturalAchievement,
  ): Promise<void> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['userAchievements'], // Corregido: usar la relación correcta
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Agregar el logro al usuario
    user.userAchievements = user.userAchievements || []; // Corregido
    // Nota: La lógica aquí podría necesitar ajustes. ¿Realmente se añade el CulturalAchievement completo?
    // O se debería crear una nueva entrada en UserAchievement? Revisar la relación ManyToMany.
    // Por ahora, asumiré que se quiere añadir a la relación existente si TypeORM lo maneja.
    // user.userAchievements.push(achievement); // Esto probablemente esté mal si es ManyToMany

    // Otorgar puntos y recompensas adicionales
    user.culturalPoints = (user.culturalPoints || 0) + achievement.pointsReward;

    await this.userRepository.save(user);
  }

  async getUserAchievements(userId: string): Promise<{
    completed: CulturalAchievement[];
    inProgress: {
      achievement: CulturalAchievement;
      progress: AchievementProgress;
    }[];
  }> {
    const progresses = await this.progressRepository.find({
      where: { user: { id: userId } },
      relations: ['achievement'],
    });

    return {
      completed: progresses
        .filter((p) => p.isCompleted)
        .map((p) => p.achievement),
      inProgress: progresses
        .filter((p) => !p.isCompleted)
        .map((p) => ({ achievement: p.achievement, progress: p })),
    };
  }

  async getAchievementProgress(
    userId: string,
    achievementId: string,
  ): Promise<AchievementProgress> {
    const progress = await this.progressRepository.findOne({
      where: {
        user: { id: userId },
        achievement: { id: achievementId },
      },
      relations: ['achievement'],
    });

    if (!progress) {
      throw new NotFoundException('Progreso no encontrado');
    }

    return progress;
  }
}
