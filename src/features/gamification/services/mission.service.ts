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
import { MissionFrequency, MissionTemplate } from "../entities/mission-template.entity"; // Importar MissionTemplate y MissionFrequency
import { GamificationService } from "./gamification.service"; // Importar GamificationService

@Injectable()
export class MissionService {
  private missionTemplateRepository: Repository<MissionTemplate>; // Declarar la propiedad

  constructor(
    @InjectRepository(Mission)
    private missionRepository: Repository<Mission>,
    @InjectRepository(Gamification)
    private gamificationRepository: Repository<Gamification>,
    @InjectRepository(MissionTemplate) // Inyectar MissionTemplateRepository
    missionTemplateRepository: Repository<MissionTemplate>, // Usar el nombre del parámetro
    private gamificationService: GamificationService // Inyectar GamificationService
  ) {
    this.missionTemplateRepository = missionTemplateRepository; // Asignar al constructor
  }

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

    // Otorgar puntos y registrar actividad usando GamificationService
    await this.gamificationService.awardPoints(
        userId,
        mission.rewardPoints,
        'mission_completed', // Tipo de actividad
        `¡Misión completada: ${mission.title}!` // Descripción
    );

    // TODO: Implementar lógica para otorgar insignia si aplica, ahora que rewardBadge fue eliminado de la entidad Mission.
    // La lógica podría implicar buscar una insignia por un ID predefinido o a través de otra configuración.

    // La actividad ya se registra en GamificationService.awardPoints
    // gamification.recentActivities.unshift({
    //   type: "mission_completed",
    //   description: `¡Misión completada: ${mission.title}!`,
    //   pointsEarned: mission.rewardPoints,
    //   timestamp: new Date(),
    // });

    // await this.gamificationRepository.save(gamification); // No es necesario guardar aquí, GamificationService lo hace
  }

  async generateDailyMissions(): Promise<Mission[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const dailyTemplates = await this.missionTemplateRepository.find({
      where: { frequency: MissionFrequency.DIARIA, isActive: true },
    });

    const dailyMissions = dailyTemplates.map(template => {
      // Aquí puedes añadir lógica para escalar targetValue y rewardPoints
      // basada en el nivel del usuario u otros factores si es necesario.
      // Por ahora, usaremos los valores base de la plantilla.
      return this.missionRepository.create({
        title: template.title,
        description: template.description,
        type: template.type,
        frequency: template.frequency,
        targetValue: template.baseTargetValue, // Usar baseTargetValue de la plantilla
        rewardPoints: template.baseRewardPoints, // Usar baseRewardPoints de la plantilla
        startDate: today,
        endDate: tomorrow,
        // Otros campos de Mission si son necesarios y están en la plantilla
      });
    });

    const missions = await this.missionRepository.save(dailyMissions);
    return missions;
  }

  async generateWeeklyMissions(): Promise<Mission[]> {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(now.getDate() - now.getDay());

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 7);

    const weeklyTemplates = await this.missionTemplateRepository.find({
      where: { frequency: MissionFrequency.SEMANAL, isActive: true },
    });

    const weeklyMissions = weeklyTemplates.map(template => {
       // Aquí puedes añadir lógica para escalar targetValue y rewardPoints
      // basada en el nivel del usuario u otros factores si es necesario.
      // Por ahora, usaremos los valores base de la plantilla.
      return this.missionRepository.create({
        title: template.title,
        description: template.description,
        type: template.type,
        frequency: template.frequency,
        targetValue: template.baseTargetValue, // Usar baseTargetValue de la plantilla
        rewardPoints: template.baseRewardPoints, // Usar baseRewardPoints de la plantilla
        startDate: startOfWeek,
        endDate: endOfWeek,
        // Otros campos de Mission si son necesarios y están en la plantilla
        // TODO: Considerar cómo manejar rewardBadge si se reintroduce la lógica
      });
    });

    const missions = await this.missionRepository.save(weeklyMissions);
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
