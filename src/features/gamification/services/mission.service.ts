import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThanOrEqual, MoreThanOrEqual, Repository } from "typeorm";
import { MissionDto } from "../dto/mission.dto";
import { UpdateMissionDto } from "../dto/update-mission.dto";
import { Mission, MissionType } from "../entities";
import { Badge } from "../entities/badge.entity";
import { Gamification } from "../entities/gamification.entity";
import { MissionFrequency } from "../entities/mission.entity";

@Injectable()
export class MissionService {
  constructor(
    @InjectRepository(Mission)
    private missionRepository: Repository<Mission>,
    @InjectRepository(Gamification)
    private gamificationRepository: Repository<Gamification>
  ) {}

  async createMission(createMissionDto: MissionDto): Promise<Mission> {
    if (!Object.values(MissionType).includes(createMissionDto.type)) {
      throw new BadRequestException(
        `Invalid mission type: ${createMissionDto.type}`
      );
    }
    const mission = this.missionRepository.create(createMissionDto);
    return this.missionRepository.save(mission);
  }

  async getActiveMissions(
    userId: string,
    type?: MissionType
  ): Promise<Mission[]> {
    const now = new Date();
    const where = {
      startDate: LessThanOrEqual(now),
      endDate: MoreThanOrEqual(now),
    };

    if (type) {
      where["type"] = type;
    }

    return this.missionRepository.find({
      where,
      order: {
        endDate: "ASC",
      },
    });
  }

  async updateMissionProgress(
    userId: string,
    type: MissionType,
    progress: number
  ): Promise<void> {
    const activeMissions = await this.getActiveMissions(userId);
    for (const mission of activeMissions) {
      let userProgress = mission.completedBy.find(
        (completion) => completion.userId === userId
      );

      if (!userProgress) {
        userProgress = {
          userId,
          progress: 0,
          completedAt: null,
        };
        mission.completedBy.push(userProgress);
      }

      // Lógica para actualizar el progreso según el tipo de misión
      switch (mission.type) {
        case MissionType.COMPLETE_LESSONS:
        case MissionType.PRACTICE_EXERCISES:
        case MissionType.EARN_POINTS:
        case MissionType.MAINTAIN_STREAK:
        case MissionType.CULTURAL_CONTENT:
        case MissionType.COMMUNITY_INTERACTION:
        case MissionType.VOCABULARY:
          userProgress.progress = progress;
          break;
        case MissionType.PERSONALIZED:
          // Lógica para misiones personalizadas
          break;
        case MissionType.PROGRESS_BASED:
          // Lógica para misiones basadas en el progreso
          break;
        case MissionType.SEASONAL:
          // Lógica para misiones de temporada
          break;
        case MissionType.COMMUNITY:
          // Lógica para misiones de comunidad
          break;
        default:
          throw new BadRequestException(
            `Tipo de misión desconocido: ${mission.type}`
          );
      }

      if (
        userProgress.progress >= mission.targetValue &&
        !userProgress.completedAt
      ) {
        userProgress.completedAt = new Date();
        await this.awardMissionRewards(userId, mission);
      }

      await this.missionRepository.save(mission);
    }
  }

  private async awardMissionRewards(
    userId: string,
    mission: Mission
  ): Promise<void> {
    const gamification = await this.gamificationRepository.findOne({
      where: { userId },
    });

    if (!gamification) {
      throw new NotFoundException(
        `Gamification profile not found for user ${userId}`
      );
    }

    // Otorgar puntos
    gamification.points += mission.rewardPoints;

    // Otorgar insignia si existe
    if (mission.rewardBadge) {
      if (!gamification.badges) {
        gamification.badges = [];
      }
      const fullBadge: Badge = {
        ...mission.rewardBadge,
        description: `Insignia por completar la misión: ${mission.title}`,
        category: "achievement",
        tier: "gold",
        requiredPoints: mission.rewardPoints,
        iconUrl: mission.rewardBadge.icon,
        requirements: {},
        isSpecial: false,
        timesAwarded: 0,
        benefits: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        expirationDate: null,
      };
      gamification.badges.push(fullBadge);
    }

    // Registrar actividad
    gamification.recentActivities.unshift({
      type: "mission_completed",
      description: `¡Misión completada: ${mission.title}!`,
      pointsEarned: mission.rewardPoints,
      timestamp: new Date(),
    });

    await this.gamificationRepository.save(gamification);
  }

  async generateDailyMissions(): Promise<Mission[]> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dailyMissions = [
      {
        title: "Aprende algo nuevo",
        description:
          "Completa 5 lecciones hoy para expandir tus conocimientos.",
        type: MissionType.COMPLETE_LESSONS,
        frequency: MissionFrequency.DIARIA,
        targetValue: 5,
        rewardPoints: 60,
        startDate: today,
        endDate: tomorrow,
      },
      {
        title: "Domina la práctica",
        description:
          "Obtén una puntuación perfecta en 3 ejercicios para perfeccionar tus habilidades.",
        type: MissionType.PRACTICE_EXERCISES,
        frequency: MissionFrequency.DIARIA,
        targetValue: 3,
        rewardPoints: 80,
        startDate: today,
        endDate: tomorrow,
      },
      {
        title: "Descubre tu cultura",
        description:
          "Explora 3 contenidos culturales para enriquecer tu perspectiva.",
        type: MissionType.CULTURAL_CONTENT,
        frequency: MissionFrequency.DIARIA,
        targetValue: 3,
        rewardPoints: 50,
        startDate: today,
        endDate: tomorrow,
      },
      {
        title: "Desafío de vocabulario",
        description: "Aprende 5 nuevas palabras hoy.",
        type: MissionType.VOCABULARY,
        frequency: MissionFrequency.DIARIA,
        targetValue: 5,
        rewardPoints: 70,
        startDate: today,
        endDate: tomorrow,
      },
    ].map((mission) => ({
      ...mission,
      rewardPoints: mission.rewardPoints * 2,
    }));

    const missions = await Promise.all(
      dailyMissions.map((mission) => this.createMission(mission))
    );

    return missions;
  }

  async generateWeeklyMissions(): Promise<Mission[]> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const weeklyMissions = [
      {
        title: "Campeón del aprendizaje",
        description:
          "Completa 25 lecciones esta semana para convertirte en un experto.",
        type: MissionType.COMPLETE_LESSONS,
        frequency: MissionFrequency.SEMANAL,
        targetValue: 25,
        rewardPoints: 400,
        startDate: startOfWeek,
        endDate: endOfWeek,
        rewardBadge: {
          id: "weekly-champion",
          name: "Campeón Semanal",
          icon: "🏆",
        },
      },
      {
        title: "Embajador cultural",
        description:
          "Realiza 10 contribuciones culturales significativas para promover la diversidad.",
        type: MissionType.CULTURAL_CONTENT,
        frequency: MissionFrequency.SEMANAL,
        targetValue: 10,
        rewardPoints: 500,
        startDate: startOfWeek,
        endDate: endOfWeek,
      },
      {
        title: "Desafío de racha semanal",
        description:
          "Mantén una racha de 7 días para desbloquear recompensas exclusivas.",
        type: MissionType.MAINTAIN_STREAK,
        frequency: MissionFrequency.SEMANAL,
        targetValue: 7,
        rewardPoints: 600,
        startDate: startOfWeek,
        endDate: endOfWeek,
      },
    ];

    const missions = await Promise.all(
      weeklyMissions.map((mission) => this.createMission(mission))
    );

    return missions;
  }

  async findOne(id: string): Promise<Mission> {
    return this.missionRepository.findOne({ where: { id } });
  }

  async update(
    id: string,
    updateMissionDto: UpdateMissionDto
  ): Promise<Mission> {
    const mission = await this.missionRepository.findOne({ where: { id } });
    if (!mission) {
      throw new NotFoundException(`Mission with id ${id} not found`);
    }
    Object.assign(mission, updateMissionDto);
    return this.missionRepository.save(mission);
  }

  async remove(id: string): Promise<void> {
    const mission = await this.missionRepository.findOne({ where: { id } });
    if (!mission) {
      throw new NotFoundException(`Mission with id ${id} not found`);
    }
    await this.missionRepository.remove(mission);
  }
}
