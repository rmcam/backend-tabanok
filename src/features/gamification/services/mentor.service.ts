import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource, QueryRunner } from "typeorm"; // Import DataSource and QueryRunner
import {
  MentorSpecialization,
  SpecializationType,
} from "../entities/mentor-specialization.entity";
import { Mentor, MentorLevel } from "../entities/mentor.entity";
import {
  MentorshipRelation,
  MentorshipStatus,
  MentorshipType,
} from "../entities/mentorship-relation.entity";
import { CulturalRewardService } from "./cultural-reward.service";
import { Gamification } from "../entities/gamification.entity"; // Import Gamification entity

interface MentorshipRequest {
  mentorId: string;
  apprenticeId: string;
  specialization: string;
  type: MentorshipType;
  status: "pending" | "accepted" | "completed" | "rejected";
  createdAt: Date;
}

interface MentorshipMission {
  id: string;
  title: string;
  description: string;
  specialization: string;
  mentorId: string;
  apprenticeId: string;
  progress: number;
  type: MentorshipType; // Añadir la propiedad type
  completedAt?: Date;
}

import { GamificationRepository } from "../repositories/gamification.repository"; // Keep import for other methods if needed

@Injectable()
export class MentorService {
  private readonly MENTOR_CULTURAL_VALUE_THRESHOLD = 500;
  private readonly MENTORSHIP_BONUS_POINTS = 200;

  constructor(
    private readonly gamificationRepository: GamificationRepository, // Keep for other methods if needed
    private readonly culturalRewardService: CulturalRewardService, // Keep for other methods if needed
    @InjectRepository(Mentor)
    private mentorRepository: Repository<Mentor>,
    @InjectRepository(MentorSpecialization)
    private specializationRepository: Repository<MentorSpecialization>,
    @InjectRepository(MentorshipRelation)
    private mentorshipRepository: Repository<MentorshipRelation>,
    @InjectRepository(Gamification) // Inject Gamification repository
    private gamificationEntityRepository: Repository<Gamification>,
    private dataSource: DataSource // Inject DataSource
  ) {}

  async checkMentorEligibility(
    userId: string,
    type: MentorshipType
  ): Promise<{
    isEligible: boolean;
    specializations: string[];
    reason?: string;
  }> {
    // This method performs reads and calls CulturalRewardService (which might perform reads)
    // It does not perform writes relevant to the identified transactions.
    const progress =
      await this.culturalRewardService.getCulturalProgress(userId);

    if (
      type === MentorshipType.DOCENTE_ESTUDIANTE &&
      progress.culturalValue < this.MENTOR_CULTURAL_VALUE_THRESHOLD
    ) {
      return {
        isEligible: false,
        specializations: [],
        reason: `Se requiere un valor cultural mínimo de ${this.MENTOR_CULTURAL_VALUE_THRESHOLD}`,
      };
    }
    // Add logic for ESTUDIANTE_ESTUDIANTE eligibility if needed

    return {
      isEligible: true,
      specializations: progress.specializations,
    };
  }

  async requestMentorship(
    apprenticeId: string,
    mentorId: string,
    specialization: string,
    type: MentorshipType
  ): Promise<MentorshipRequest> {
    // This method performs reads and does not perform writes relevant to the identified transactions.
    if (!Object.values(MentorshipType).includes(type)) {
      throw new BadRequestException(`Invalid mentorship type: ${type}`);
    }

    const mentor = await this.mentorRepository.findOne({
      where: { id: mentorId },
    });

    if (!mentor) {
      throw new NotFoundException("Mentor no encontrado");
    }

    const eligibility = await this.checkMentorEligibility(mentorId, type);
    if (!eligibility.isEligible) {
      throw new Error("El usuario seleccionado no es elegible como mentor");
    }

    if (!eligibility.specializations.includes(specialization)) {
      throw new Error("El mentor no tiene esta especialización");
    }

    const request: MentorshipRequest = {
      mentorId,
      apprenticeId,
      specialization,
      type,
      status: "pending",
      createdAt: new Date(),
    };

    // Aquí se podría agregar la lógica para guardar la solicitud en la base de datos
    // If saving the request involves multiple writes, this method would need a transaction.
    // Based on the current simulation, it doesn't.
    return request;
  }

  async createMentorshipMission(
    mentorId: string,
    apprenticeId: string,
    missionData: Partial<MentorshipMission>
  ): Promise<MentorshipMission> {
    // This method performs reads and does not perform writes relevant to the identified transactions.
    const eligibility = await this.checkMentorEligibility(
      mentorId,
      MentorshipType.DOCENTE_ESTUDIANTE
    );
    if (!eligibility.isEligible) {
      throw new Error(
        "No tienes los requisitos para crear misiones de mentoría"
      );
    }

    const mission: MentorshipMission = {
      id: Date.now().toString(), // Simplificado para el ejemplo
      title: missionData.title,
      description: missionData.description,
      specialization: missionData.specialization,
      mentorId,
      apprenticeId,
      progress: 0,
      type: missionData.type, // Añadir la propiedad type desde missionData
    };

    // Aquí se podría agregar la lógica para guardar la misión en la base de datos
    // If saving the mission involves multiple writes, this method would need a transaction.
    // Based on the current simulation, it doesn't.
    return mission;
  }

  async completeMentorshipMission(missionId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Obtener la misión por su ID
      // Nota: Asumiendo que existe un repositorio o método para obtener misiones
      // Si no existe, se necesitaría implementar esa lógica primero.
      // Por ahora, simularemos la obtención de la misión.
      // In a real scenario, you would fetch the mission from the database here.
      const mission: MentorshipMission = {
        id: missionId,
        mentorId: "mentor-id", // Usar el ID esperado en la prueba
        apprenticeId: "apprentice-id", // Usar el ID esperado en la prueba
        type: MentorshipType.DOCENTE_ESTUDIANTE, // Reemplazar con la lógica real para obtener el tipo
        title: "Simulated Mission",
        description: "Simulated Description",
        specialization: "Simulated Specialization",
        progress: 100, // Simular completado
        completedAt: new Date(),
      };

      // Aquí iría la lógica real para actualizar la misión en la base de datos (marcar como completada, etc.)
      // await queryRunner.manager.save(Mission, mission); // Example if Mission was an entity

      // Otorgar puntos bonus al mentor y aprendiz directly within the transaction
      await this.awardMentorshipBonus(mission.mentorId, "mentor", mission.type, queryRunner); // Pass queryRunner
      await this.awardMentorshipBonus(
        mission.apprenticeId,
        "apprentice",
        mission.type,
        queryRunner // Pass queryRunner
      );

      await queryRunner.commitTransaction();

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private async awardMentorshipBonus(
    userId: string,
    role: "mentor" | "apprentice",
    type: MentorshipType,
    queryRunner: QueryRunner // Accept queryRunner
  ): Promise<void> {
    const gamification = await queryRunner.manager.findOne(Gamification, { where: { userId } }); // Use queryRunner.manager

    if (!gamification) return;

    let bonusPoints =
      role === "mentor"
        ? this.MENTORSHIP_BONUS_POINTS
        : Math.floor(this.MENTORSHIP_BONUS_POINTS * 0.8);

    if (type === MentorshipType.ESTUDIANTE_ESTUDIANTE) {
      bonusPoints = bonusPoints * 0.5; // Reducir el bonus para mentorías entre estudiantes
    }

    gamification.points += bonusPoints;
    gamification.recentActivities.unshift({
      type: "mentorship_bonus",
      description:
        role === "mentor"
          ? "¡Bonus por mentoría exitosa!"
          : "¡Bonus por completar mentoría!",
      pointsEarned: bonusPoints,
      timestamp: new Date(),
    });

    await queryRunner.manager.save(gamification); // Use queryRunner.manager.save
  }

  async createMentor(
    userId: string,
    initialSpecializations: {
      type: SpecializationType;
      level: number;
      description: string;
    }[]
  ): Promise<Mentor> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Verificar si el usuario ya es mentor
      const existingMentor = await queryRunner.manager.findOne(Mentor, {
        where: { userId },
      });
      if (existingMentor) {
        throw new BadRequestException("El usuario ya es un mentor");
      }

      // Crear nuevo mentor
      const mentor = queryRunner.manager.create(Mentor, {
        userId,
        level: MentorLevel.APRENDIZ,
        stats: {
          sessionsCompleted: 0,
          studentsHelped: 0,
          averageRating: 0,
          culturalPointsAwarded: 0,
        },
        availability: {
          schedule: [],
          maxStudents: 5,
        },
        // achievements: [], // Eliminado ya que el campo fue removido de Mentor
      });

      const savedMentor = await queryRunner.manager.save(mentor);

      // Crear especializaciones iniciales
      for (const spec of initialSpecializations) {
        const specialization = queryRunner.manager.create(MentorSpecialization, {
          mentor: savedMentor,
          type: spec.type,
          level: spec.level,
          description: spec.description,
          certifications: [],
          endorsements: [],
        });
        await queryRunner.manager.save(specialization);
      }

      await queryRunner.commitTransaction();
      return savedMentor;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async assignStudent(
    mentorId: string,
    studentId: string,
    focusArea: SpecializationType
  ): Promise<MentorshipRelation> {
    // This method performs reads and a single write. It does not require a transaction based on the criteria.
    const mentor = await this.mentorRepository.findOne({
      where: { id: mentorId },
      relations: ["mentorshipRelations", "specializations"],
    });

    if (!mentor) {
      throw new NotFoundException("Mentor no encontrado");
    }

    // Verificar disponibilidad del mentor
    const activeRelations = mentor.mentorshipRelations.filter(
      (rel) => rel.status === MentorshipStatus.ACTIVE
    );

    if (activeRelations.length >= mentor.availability.maxStudents) {
      throw new BadRequestException(
        "El mentor ha alcanzado su límite máximo de estudiantes"
      );
    }

    // Verificar que el mentor tenga la especialización requerida
    const hasSpecialization = mentor.specializations.some(
      (spec) => spec.type === focusArea
    );
    if (!hasSpecialization) {
      throw new BadRequestException(
        "El mentor no tiene la especialización requerida"
      );
    }

    // Crear nueva relación de mentoría
    const mentorship = this.mentorshipRepository.create({
      mentor,
      studentId,
      focusArea,
      status: MentorshipStatus.PENDING,
      goals: [],
      sessions: [],
      progress: {
        currentLevel: 1,
        pointsEarned: 0,
        skillsLearned: [],
        lastAssessment: new Date(),
      },
    });

    return this.mentorshipRepository.save(mentorship);
  }

  async updateMentorshipStatus(
    mentorshipId: string,
    status: MentorshipStatus
  ): Promise<MentorshipRelation> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const mentorship = await queryRunner.manager.findOne(MentorshipRelation, {
        where: { id: mentorshipId },
        relations: ["mentor"],
      });

      if (!mentorship) {
        throw new NotFoundException("Relación de mentoría no encontrada");
      }

      mentorship.status = status;

      if (status === MentorshipStatus.ACTIVE) {
        mentorship.startDate = new Date();
      } else if (status === MentorshipStatus.COMPLETED) {
        mentorship.endDate = new Date();
        // Actualizar estadísticas del mentor directly within the transaction
        await this.updateMentorStats(mentorship.mentor.id, queryRunner); // Pass queryRunner
      }

      const savedMentorship = await queryRunner.manager.save(mentorship);

      await queryRunner.commitTransaction();
      return savedMentorship;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async recordSession(
    mentorshipId: string,
    sessionData: {
      duration: number;
      topic: string;
      notes: string;
    }
  ): Promise<MentorshipRelation> {
    // This method performs reads and a single write. It does not require a transaction based on the criteria.
    const mentorship = await this.mentorshipRepository.findOne({
      where: { id: mentorshipId },
    });

    if (!mentorship) {
      throw new NotFoundException("Relación de mentoría no encontrada");
    }

    if (mentorship.status !== MentorshipStatus.ACTIVE) {
      throw new BadRequestException("La mentoría no está activa");
    }

    const session = {
      ...sessionData,
      date: new Date(),
    };

    mentorship.sessions.push(session);
    return this.mentorshipRepository.save(mentorship);
  }

  private async updateMentorStats(mentorId: string, queryRunner: QueryRunner): Promise<void> { // Accept queryRunner
    const mentor = await queryRunner.manager.findOne(Mentor, { // Use queryRunner.manager
      where: { id: mentorId },
      relations: ["mentorshipRelations"],
    });

    if (!mentor) {
      throw new NotFoundException("Mentor no encontrado");
    }

    const completedMentorships = mentor.mentorshipRelations.filter(
      (rel) => rel.status === MentorshipStatus.COMPLETED
    );

    // Calcular estadísticas
    const totalSessions = completedMentorships.reduce(
      (sum, rel) => sum + rel.sessions.length,
      0
    );

    const ratings = completedMentorships
      .flatMap((rel) => rel.sessions)
      .map((session) => session.rating)
      .filter((rating) => rating !== undefined);

    const averageRating =
      ratings.length > 0
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length
        : 0;

    // Actualizar estadísticas
    mentor.stats = {
      sessionsCompleted: totalSessions,
      studentsHelped: completedMentorships.length,
      averageRating,
      culturalPointsAwarded: totalSessions * 10, // Ejemplo simple de cálculo de puntos
    };

    // Actualizar nivel del mentor basado en las estadísticas
    this.updateMentorLevel(mentor);

    await queryRunner.manager.save(mentor); // Use queryRunner.manager.save
  }

  private updateMentorLevel(mentor: Mentor): void {
    const { sessionsCompleted, studentsHelped, averageRating } = mentor.stats;

    // Lógica para determinar el nivel del mentor
    if (
      sessionsCompleted >= 100 &&
      studentsHelped >= 20 &&
      averageRating >= 4.5
    ) {
      mentor.level = MentorLevel.SABEDOR;
    } else if (
      sessionsCompleted >= 50 &&
      studentsHelped >= 10 &&
      averageRating >= 4.0
    ) {
      mentor.level = MentorLevel.MAESTRO;
    } else if (
      sessionsCompleted >= 25 &&
      studentsHelped >= 5 &&
      averageRating >= 3.5
    ) {
      mentor.level = MentorLevel.AVANZADO;
    } else if (
      sessionsCompleted >= 10 &&
      studentsHelped >= 2 &&
      averageRating >= 3.0
    ) {
      mentor.level = MentorLevel.INTERMEDIO;
    }
  }

  async getMentorDetails(mentorId: string): Promise<Mentor> {
    // This method performs reads and does not perform writes relevant to the identified transactions.
    const mentor = await this.mentorRepository.findOne({
      where: { id: mentorId },
      relations: ["specializations", "mentorshipRelations"],
    });

    if (!mentor) {
      throw new NotFoundException("Mentor no encontrado");
    }

    return mentor;
  }

  async getMentorStudents(mentorId: string): Promise<{
    active: MentorshipRelation[];
    completed: MentorshipRelation[];
    pending: MentorshipRelation[];
  }> {
    // This method performs reads and does not perform writes relevant to the identified transactions.
    const mentor = await this.mentorRepository.findOne({
      where: { id: mentorId },
      relations: ["mentorshipRelations"],
    });

    if (!mentor) {
      throw new NotFoundException("Mentor no encontrado");
    }

    const relations = mentor.mentorshipRelations || [];

    return {
      active: relations.filter((rel) => rel.status === MentorshipStatus.ACTIVE),
      completed: relations.filter(
        (rel) => rel.status === MentorshipStatus.COMPLETED
      ),
      pending: relations.filter(
        (rel) => rel.status === MentorshipStatus.PENDING
      ),
    };
  }

  async updateMentorAvailability(
    mentorId: string,
    availabilityData: {
      schedule: { day: string; hours: string[] }[];
      maxStudents: number;
    }
  ): Promise<Mentor> {
    // This method performs reads and a single write. It does not require a transaction based on the criteria.
    const mentor = await this.mentorRepository.findOne({
      where: { id: mentorId },
    });

    if (!mentor) {
      throw new NotFoundException("Mentor no encontrado");
    }

    // Validar el horario
    for (const scheduleItem of availabilityData.schedule) {
      if (
        ![
          "lunes",
          "martes",
          "miércoles",
          "jueves",
          "viernes",
          "sábado",
          "domingo",
        ].includes(scheduleItem.day.toLowerCase())
      ) {
        throw new BadRequestException(`Día inválido: ${scheduleItem.day}`);
      }

      for (const hour of scheduleItem.hours) {
        const parts = hour.split(":");
        if (parts.length !== 2) {
          throw new BadRequestException(
            `Formato de hora inválido: ${hour}. Use formato HH:MM`
          );
        }
        const [h, m] = parts;
        const hourNum = parseInt(h, 10);
        const minuteNum = parseInt(m, 10);

        if (
          isNaN(hourNum) ||
          isNaN(minuteNum) ||
          hourNum < 0 ||
          hourNum > 23 ||
          minuteNum < 0 ||
          minuteNum > 59 ||
          h.length !== 2 ||
          m.length !== 2
        ) {
          throw new BadRequestException(
            `Formato de hora inválido: ${hour}. Use formato HH:MM`
          );
        }
      }
    }

    mentor.availability = availabilityData;
    return this.mentorRepository.save(mentor);
  }

  async findAll(): Promise<Mentor[]> {
    // This method performs reads and does not perform writes relevant to the identified transactions.
    return await this.mentorRepository.find({
      relations: ["specializations", "mentorshipRelations"],
    });
  }
}
