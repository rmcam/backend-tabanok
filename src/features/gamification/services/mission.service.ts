import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThanOrEqual, MoreThanOrEqual, Repository, DataSource, QueryRunner } from "typeorm"; // Import DataSource and QueryRunner
import { MissionDto } from "../dto/mission.dto";
import { UpdateMissionDto } from "../dto/update-mission.dto";
import { Mission, MissionType } from "../entities";
import { Badge } from "../entities/badge.entity";
import { Gamification } from "../entities/gamification.entity";
import { MissionFrequency, MissionTemplate } from "../entities/mission-template.entity"; // Importar MissionTemplate y MissionFrequency
import { GamificationService } from "./gamification.service"; // Keep GamificationService for other methods if needed

@Injectable()
export class MissionService {
  private missionTemplateRepository: Repository<MissionTemplate>; // Declarar la propiedad
  private gamificationEntityRepository: Repository<Gamification>; // Declare Gamification entity repository

  constructor(
    @InjectRepository(Mission)
    private missionRepository: Repository<Mission>,
    @InjectRepository(Gamification)
    gamificationEntityRepository: Repository<Gamification>, // Use parameter name
    @InjectRepository(MissionTemplate) // Inyectar MissionTemplateRepository
    missionTemplateRepository: Repository<MissionTemplate>, // Usar el nombre del parámetro
    private gamificationService: GamificationService, // Keep GamificationService for other methods if needed
    private dataSource: DataSource // Inject DataSource
  ) {
    this.missionTemplateRepository = missionTemplateRepository; // Asignar al constructor
    this.gamificationEntityRepository = gamificationEntityRepository; // Assign to constructor
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
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const activeMissions = await queryRunner.manager.find(Mission, { // Use queryRunner.manager
        where: {
          startDate: LessThanOrEqual(new Date()),
          endDate: MoreThanOrEqual(new Date()),
        },
        order: {
          endDate: "ASC",
        },
      });

      const gamification = await queryRunner.manager.findOne(Gamification, { where: { userId } }); // Fetch gamification within transaction

      if (!gamification) {
           await queryRunner.commitTransaction(); // Commit empty transaction
           return;
      }

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
          await this.awardMissionRewards(userId, mission, gamification, queryRunner); // Pass gamification and queryRunner
        }

        await queryRunner.manager.save(mission); // Use queryRunner.manager.save
      }

      await queryRunner.manager.save(gamification); // Save gamification changes after the loop
      await queryRunner.commitTransaction();

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private async awardMissionRewards(
    userId: string,
    mission: Mission,
    gamification: Gamification, // Accept gamification entity
    queryRunner: QueryRunner // Accept queryRunner
  ): Promise<void> {
    // Otorgar puntos y registrar actividad directly within the transaction
    gamification.points += mission.rewardPoints;
    gamification.experience += mission.rewardPoints; // Assuming experience also increases

    // Register mission completion activity
    gamification.recentActivities.unshift({
      type: 'mission_completed',
      description: `¡Misión completada: ${mission.title}!`,
      pointsEarned: mission.rewardPoints,
      timestamp: new Date()
    });

    // TODO: Implementar lógica para otorgar insignia si aplica, ahora que rewardBadge fue eliminado de la entidad Mission.
    // La lógica podría implicar buscar una insignia por un ID predefinido o a través de otra configuración.

    // Do NOT save gamification here. It will be saved after the loop in updateMissionProgress.
    // await queryRunner.manager.save(gamification);
  }

  async generateDailyMissions(): Promise<Mission[]> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const dailyTemplates = await queryRunner.manager.find(MissionTemplate, { // Use queryRunner.manager
        where: { frequency: MissionFrequency.DIARIA, isActive: true },
      });

      const dailyMissions = dailyTemplates.map(template => {
        // Aquí puedes añadir lógica para escalar targetValue y rewardPoints
        // basada en el nivel del usuario u otros factores si es necesario.
        // Por ahora, usaremos los valores base de la plantilla.
        return queryRunner.manager.create(Mission, { // Use queryRunner.manager.create
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

      const missions = await queryRunner.manager.save(dailyMissions); // Use queryRunner.manager.save
      await queryRunner.commitTransaction();
      return missions;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async generateWeeklyMissions(): Promise<Mission[]> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setHours(0, 0, 0, 0);
      startOfWeek.setDate(now.getDate() - now.getDay());

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      const weeklyTemplates = await queryRunner.manager.find(MissionTemplate, { // Use queryRunner.manager
        where: { frequency: MissionFrequency.SEMANAL, isActive: true },
      });

      const weeklyMissions = weeklyTemplates.map(template => {
         // Aquí puedes añadir lógica para escalar targetValue y rewardPoints
        // basada en el nivel del usuario u otros factores si es necesario.
        // Por ahora, usaremos los valores base de la plantilla.
        return queryRunner.manager.create(Mission, { // Use queryRunner.manager.create
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

      const missions = await queryRunner.manager.save(weeklyMissions); // Use queryRunner.manager.save
      await queryRunner.commitTransaction();
      return missions;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
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
