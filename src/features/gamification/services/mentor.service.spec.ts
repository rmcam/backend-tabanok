import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { MentorSpecialization } from "../entities/mentor-specialization.entity";
import { Mentor } from "../entities/mentor.entity";
import {
  MentorshipRelation,
  MentorshipType,
  MentorshipStatus, // Import MentorshipStatus
} from "../entities/mentorship-relation.entity";
import { GamificationRepository } from "../repositories/gamification.repository";
import { CulturalRewardService } from "./cultural-reward.service";
import { MentorService } from "./mentor.service";
import { BadRequestException, NotFoundException } from "@nestjs/common"; // Import necessary exceptions

describe("MentorService", () => {
  let service: MentorService;
  let module: TestingModule; // Declare module here
  let gamificationRepositoryMock: any; // Mock GamificationRepository
  let mentorRepositoryMock: any; // Mock Mentor repository
  let specializationRepositoryMock: any; // Mock MentorSpecialization repository
  let mentorshipRepositoryMock: any; // Mock MentorshipRelation repository
  let culturalRewardServiceMock: any; // Mock CulturalRewardService

  beforeEach(async () => {
    // Initialize mocks
    mentorRepositoryMock = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      remove: jest.fn(),
    };
    specializationRepositoryMock = {
      create: jest.fn(),
      save: jest.fn(),
    };
    mentorshipRepositoryMock = {
      create: jest.fn().mockImplementation(data => data), // Keep create mock
      save: jest.fn().mockImplementation(data => data), // Modify save mock to return the data
      findOne: jest.fn(),
      find: jest.fn(), // Added find for getMentorStudents
    };
    gamificationRepositoryMock = {
      findOne: jest.fn(),
      save: jest.fn(),
    };

    culturalRewardServiceMock = {
      getCulturalProgress: jest.fn(),
    };


    module = await Test.createTestingModule({
      // Assign to the outer module
      providers: [
        MentorService,
        {
          provide: GamificationRepository, // Provide the class directly
          useValue: gamificationRepositoryMock,
        },
        {
          provide: CulturalRewardService,
          useValue: culturalRewardServiceMock,
        },
        {
          provide: getRepositoryToken(Mentor),
          useValue: mentorRepositoryMock,
        },
        {
          provide: getRepositoryToken(MentorSpecialization),
          useValue: specializationRepositoryMock,
        },
        {
          provide: getRepositoryToken(MentorshipRelation),
          useValue: mentorshipRepositoryMock,
        },
      ],
    }).compile();

    service = module.get<MentorService>(MentorService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("checkMentorEligibility", () => {
    it("should return true and specializations if user is eligible", async () => {
      // Mock CulturalRewardService.getCulturalProgress to return eligible progress
      culturalRewardServiceMock.getCulturalProgress.mockResolvedValue({
        culturalValue: 600, // Above threshold
        specializations: ["linguistics", "culture"],
      });

      const userId = "test-user-id";
      const type = MentorshipType.DOCENTE_ESTUDIANTE;

      const result = await service.checkMentorEligibility(userId, type);

      expect(culturalRewardServiceMock.getCulturalProgress).toHaveBeenCalledWith(userId);
      expect(result.isEligible).toBe(true);
      expect(result.specializations).toEqual(["linguistics", "culture"]);
      expect(result.reason).toBeUndefined();
    });

    it("should return false and reason if user is not eligible (cultural value below threshold)", async () => {
      culturalRewardServiceMock.getCulturalProgress.mockResolvedValue({
        culturalValue: 400, // Below threshold
        specializations: ["linguistics"],
      });

      const userId = "test-user-id";
      const type = MentorshipType.DOCENTE_ESTUDIANTE;

      const result = await service.checkMentorEligibility(userId, type);

      expect(culturalRewardServiceMock.getCulturalProgress).toHaveBeenCalledWith(userId);
      expect(result.isEligible).toBe(false);
      expect(result.specializations).toEqual([]);
      expect(result.reason).toBe(
        `Se requiere un valor cultural mínimo de ${service["MENTOR_CULTURAL_VALUE_THRESHOLD"]}`
      );
    });

    // Add more test cases for other eligibility conditions if they are added later
  });

  describe("requestMentorship", () => {
    const apprenticeId = "apprentice-id";
    const mentorId = "mentor-id";
    const specialization = "linguistics";
    const type = MentorshipType.DOCENTE_ESTUDIANTE;

    it("should successfully request mentorship if mentor is eligible and has specialization", async () => {
      // Mock mentorRepository.findOne to return a valid mentor
      mentorRepositoryMock.findOne.mockResolvedValueOnce({
        id: mentorId,
        userId: "mentor-user-id",
        specializations: [{ type: specialization }], // Mentor has the required specialization
        mentorshipRelations: [],
        availability: { maxStudents: 5 },
      });

      culturalRewardServiceMock.getCulturalProgress.mockResolvedValue({
        culturalValue: 600,
        specializations: [specialization],
      });

      const result = await service.requestMentorship(
        apprenticeId,
        mentorId,
        specialization,
        type
      );

      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: mentorId },
      });
      expect(
        culturalRewardServiceMock.getCulturalProgress
      ).toHaveBeenCalledWith(mentorId);
      expect(result).toEqual(
        expect.objectContaining({
          mentorId,
          apprenticeId,
          specialization,
          type,
          status: "pending",
          createdAt: expect.any(Date),
        })
      );
      // Assuming the service saves the request, check if save was called
      // expect(mentorshipRepositoryMock.save).toHaveBeenCalledWith(expect.objectContaining({
      //     mentorId,
      //     apprenticeId,
      //     specialization,
      //     type,
      //     status: 'pending',
      // }));
    });

    it("should throw BadRequestException for invalid mentorship type", async () => {
      const invalidType = "invalid_type" as any; // Cast to any to test invalid input

      await expect(
        service.requestMentorship(
          apprenticeId,
          mentorId,
          specialization,
          invalidType
        )
      ).rejects.toThrow("Invalid mentorship type: invalid_type");
    });

    it("should throw NotFoundException if mentor is not found", async () => {
      // Mock mentorRepository.findOne to return undefined
      mentorRepositoryMock.findOne.mockResolvedValueOnce(undefined);

      await expect(
        service.requestMentorship(apprenticeId, mentorId, specialization, type)
      ).rejects.toThrow("Mentor no encontrado");
      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: mentorId },
      });
    });

    it("should throw Error if mentor is not eligible", async () => {
      // Mock mentorRepository.findOne to return a valid mentor
      mentorRepositoryMock.findOne.mockResolvedValueOnce({
        id: mentorId,
        userId: "mentor-user-id",
        specializations: [{ type: specialization }],
        mentorshipRelations: [],
        availability: { maxStudents: 5 },
      });

      // Mock CulturalRewardService.getCulturalProgress to return a culturalValue below the threshold
      culturalRewardServiceMock.getCulturalProgress.mockResolvedValue({
        culturalValue: 400, // Below the threshold of 500
        specializations: [specialization], // Include the specialization
      });

      await expect(
        service.requestMentorship(apprenticeId, mentorId, specialization, type)
      ).rejects.toThrow("El usuario seleccionado no es elegible como mentor");
      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: mentorId },
      });
      expect(
        culturalRewardServiceMock.getCulturalProgress
      ).toHaveBeenCalledWith(mentorId);
    });

    it("should throw Error if mentor does not have the required specialization", async () => {
      // Mock mentorRepository.findOne to return a valid mentor
      mentorRepositoryMock.findOne.mockResolvedValueOnce({
        id: mentorId,
        userId: "mentor-user-id",
        specializations: [{ type: "culture" }], // Mentor does NOT have 'linguistics'
        mentorshipRelations: [],
        availability: { maxStudents: 5 },
      });

      // Mock CulturalRewardService.getCulturalProgress to return eligible and with the correct specializations
      culturalRewardServiceMock.getCulturalProgress.mockResolvedValue({
        culturalValue: 600, // Above threshold
        specializations: ["culture"],
      });

      await expect(
        service.requestMentorship(apprenticeId, mentorId, specialization, type)
      ).rejects.toThrow("El mentor no tiene esta especialización");
      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: mentorId },
      });
      expect(
        culturalRewardServiceMock.getCulturalProgress
      ).toHaveBeenCalledWith(mentorId);
    });
  });

  describe("createMentorshipMission", () => {
    const mentorId = "mentor-id";
    const apprenticeId = "apprentice-id";
    const missionData = {
      title: "Test Mentorship Mission",
      description: "Description",
      specialization: "linguistics",
    };

    it("should create a mentorship mission if mentor is eligible", async () => {
      culturalRewardServiceMock.getCulturalProgress.mockResolvedValue({
        culturalValue: 600, // Eligible
        specializations: ["linguistics"],
      });

      const result = await service.createMentorshipMission(
        mentorId,
        apprenticeId,
        missionData as any
      );

      expect(
        culturalRewardServiceMock.getCulturalProgress
      ).toHaveBeenCalledWith(mentorId);
      expect(result).toEqual(
        expect.objectContaining({
          id: expect.any(String), // Assuming ID is generated
          title: missionData.title,
          description: missionData.description,
          specialization: missionData.specialization,
          mentorId,
          apprenticeId,
          progress: 0,
        })
      );
    });

    it("should throw an error if mentor is not eligible", async () => {
      culturalRewardServiceMock.getCulturalProgress.mockResolvedValue({
        culturalValue: 400, // Not eligible
        specializations: ["linguistics"],
      });

      await expect(
        service.createMentorshipMission(
          mentorId,
          apprenticeId,
          missionData as any
        )
      ).rejects.toThrow(
        "No tienes los requisitos para crear misiones de mentoría"
      );
      expect(
        culturalRewardServiceMock.getCulturalProgress
      ).toHaveBeenCalledWith(mentorId);
    });
  });

  describe("completeMentorshipMission", () => {
    const mentorId = 'mentor-id'; // Use variables from the describe block
    const apprenticeId = 'apprentice-id'; // Use variables from the describe block

    it("should call awardMentorshipBonus for mentor and apprentice", async () => {
      const missionId = "mission-id";
      // Ajustar el mock interno para usar los IDs correctos
      const mockMission = {
        mentorId: mentorId, // Usar variable del describe
        apprenticeId: apprenticeId, // Usar variable del describe
        type: MentorshipType.DOCENTE_ESTUDIANTE,
      };
      // Mock the internal logic that would fetch the mission
      jest
        .spyOn(service as any, "awardMentorshipBonus")
        .mockResolvedValue(undefined); // Mantener mockResolvedValue si no se necesita simular la lógica interna

      // Since the actual implementation in the service is simulated, we'll mock the internal calls
      // If the service were to fetch the mission from a repository, we would mock that here.
      // For now, we'll directly call the method and check the internal calls.
      await (service as any).completeMentorshipMission(missionId);

      expect(service["awardMentorshipBonus"]).toHaveBeenCalledTimes(2);
      expect(service["awardMentorshipBonus"]).toHaveBeenCalledWith(
        mockMission.mentorId,
        "mentor",
        mockMission.type
      );
      expect(service["awardMentorshipBonus"]).toHaveBeenCalledWith(
        mockMission.apprenticeId,
        "apprentice",
        mockMission.type
      );
    });
  });

  describe('assignStudent', () => {
    const mentorId = 'mentor-id';
    const studentId = 'student-id';
    const focusArea = 'linguistics' as any;

    it('should assign a student to a mentor if mentor is available and has specialization', async () => {
      const mockMentor = {
        id: mentorId,
        userId: 'mentor-user-id',
        specializations: [{ type: focusArea }],
        mentorshipRelations: [], // Mentor has availability
        availability: { maxStudents: 5 },
      };
      mentorRepositoryMock.findOne.mockResolvedValueOnce(mockMentor);
      mentorshipRepositoryMock.create.mockImplementation(data => data);
      // mentorshipRepositoryMock.save.mockResolvedValue({}); // Eliminar este mock específico

      const result = await service.assignStudent(mentorId, studentId, focusArea);

      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: mentorId },
        relations: ["mentorshipRelations", "specializations"],
      });
      expect(mentorshipRepositoryMock.create).toHaveBeenCalledWith(expect.objectContaining({
        mentor: mockMentor,
        studentId,
        focusArea,
        status: 'PENDING',
      }));
      expect(mentorshipRepositoryMock.save).toHaveBeenCalled();
      expect(result).toEqual(expect.objectContaining({
        mentor: mockMentor,
        studentId,
        focusArea,
        status: 'PENDING',
      }));
    });

    it('should throw NotFoundException if mentor is not found', async () => {
      mentorRepositoryMock.findOne.mockResolvedValueOnce(undefined);

      await expect(service.assignStudent(mentorId, studentId, focusArea)).rejects.toThrow(NotFoundException);
      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: mentorId },
        relations: ["mentorshipRelations", "specializations"],
      });
      expect(mentorshipRepositoryMock.create).not.toHaveBeenCalled();
      expect(mentorshipRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if mentor has reached max students', async () => {
      const mockMentor = {
        id: mentorId,
        userId: 'mentor-user-id',
        specializations: [{ type: focusArea }],
        mentorshipRelations: [{ status: 'ACTIVE' }, { status: 'ACTIVE' }, { status: 'ACTIVE' }, { status: 'ACTIVE' }, { status: 'ACTIVE' }], // 5 active relations
        availability: { maxStudents: 5 },
      };
      mentorRepositoryMock.findOne.mockResolvedValueOnce(mockMentor);

      await expect(service.assignStudent(mentorId, studentId, focusArea)).rejects.toThrow('El mentor ha alcanzado su límite máximo de estudiantes');
      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: mentorId },
        relations: ["mentorshipRelations", "specializations"],
      });
      expect(mentorshipRepositoryMock.create).not.toHaveBeenCalled();
      expect(mentorshipRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if mentor does not have the required specialization', async () => {
      const mockMentor = {
        id: mentorId,
        userId: 'mentor-user-id',
        specializations: [{ type: 'another-area' }], // Does not have 'linguistics'
        mentorshipRelations: [],
        availability: { maxStudents: 5 },
      };
      mentorRepositoryMock.findOne.mockResolvedValueOnce(mockMentor);

      await expect(service.assignStudent(mentorId, studentId, focusArea)).rejects.toThrow('El mentor no tiene la especialización requerida');
      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: mentorId },
        relations: ["mentorshipRelations", "specializations"],
      });
      expect(mentorshipRepositoryMock.create).not.toHaveBeenCalled();
      expect(mentorshipRepositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('updateMentorshipStatus', () => {
    const mentorshipId = 'mentorship-id';
    const mentorId = 'mentor-id';

    it('should update mentorship status to ACTIVE and set startDate', async () => {
      const mockMentorship = { id: mentorshipId, status: 'PENDING', mentor: { id: mentorId }, startDate: null };
      mentorshipRepositoryMock.findOne.mockResolvedValueOnce(mockMentorship);
      mentorshipRepositoryMock.save.mockImplementation(data => data);
      const updateMentorStatsSpy = jest.spyOn(service as any, 'updateMentorStats');

      const result = await service.updateMentorshipStatus(mentorshipId, MentorshipStatus.ACTIVE);

      expect(mentorshipRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: mentorshipId },
        relations: ["mentor"],
      });
      expect(mockMentorship.status).toBe('ACTIVE');
      expect(mockMentorship.startDate).toBeInstanceOf(Date);
      expect(mentorshipRepositoryMock.save).toHaveBeenCalledWith(mockMentorship);
      expect(updateMentorStatsSpy).not.toHaveBeenCalled();
      expect(result).toEqual(mockMentorship);
    });

    it('should update mentorship status to COMPLETED and set endDate and call updateMentorStats', async () => {
      const mockMentorship = { id: mentorshipId, status: 'ACTIVE', mentor: { id: mentorId }, startDate: new Date(), endDate: null };
      mentorshipRepositoryMock.findOne.mockResolvedValueOnce(mockMentorship);
      mentorshipRepositoryMock.save.mockImplementation(data => data);
      const updateMentorStatsSpy = jest.spyOn(service as any, 'updateMentorStats').mockResolvedValue(undefined);

      const result = await service.updateMentorshipStatus(mentorshipId, MentorshipStatus.COMPLETED);

      expect(mentorshipRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: mentorshipId },
        relations: ["mentor"],
      });
      expect(mockMentorship.status).toBe('COMPLETED');
      expect(mockMentorship.endDate).toBeInstanceOf(Date);
      expect(mentorshipRepositoryMock.save).toHaveBeenCalledWith(mockMentorship);
      expect(updateMentorStatsSpy).toHaveBeenCalledWith(mentorId);
      expect(result).toEqual(mockMentorship);
    });

    it('should throw NotFoundException if mentorship relation is not found', async () => {
      mentorshipRepositoryMock.findOne.mockResolvedValueOnce(undefined);
      const updateMentorStatsSpy = jest.spyOn(service as any, 'updateMentorStats');

      await expect(service.updateMentorshipStatus(mentorshipId, MentorshipStatus.ACTIVE)).rejects.toThrow('Relación de mentoría no encontrada');
      expect(mentorshipRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: mentorshipId },
        relations: ["mentor"],
      });
      expect(mentorshipRepositoryMock.save).not.toHaveBeenCalled();
      expect(updateMentorStatsSpy).not.toHaveBeenCalled();
    });
  });

  describe('recordSession', () => {
    const mentorshipId = 'mentorship-id';
    const sessionData = { duration: 60, topic: 'Test Topic', notes: 'Test notes' };

    it('should record a session for an active mentorship', async () => {
      const mockMentorship = { id: mentorshipId, status: MentorshipStatus.ACTIVE, sessions: [] };
      mentorshipRepositoryMock.findOne.mockResolvedValueOnce(mockMentorship);
      mentorshipRepositoryMock.save.mockImplementation(data => data);

      const result = await service.recordSession(mentorshipId, sessionData);

      expect(mentorshipRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: mentorshipId } });
      expect(mockMentorship.sessions.length).toBe(1);
      expect(mockMentorship.sessions[0]).toEqual(expect.objectContaining({
        duration: sessionData.duration,
        topic: sessionData.topic,
        notes: sessionData.notes,
        date: expect.any(Date),
      }));
      expect(mentorshipRepositoryMock.save).toHaveBeenCalledWith(mockMentorship);
      expect(result).toEqual(mockMentorship);
    });

    it('should throw NotFoundException if mentorship relation is not found', async () => {
      mentorshipRepositoryMock.findOne.mockResolvedValueOnce(undefined);

      await expect(service.recordSession(mentorshipId, sessionData)).rejects.toThrow('Relación de mentoría no encontrada');
      expect(mentorshipRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: mentorshipId } });
      expect(mentorshipRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException if mentorship is not active', async () => {
      const mockMentorship = { id: mentorshipId, status: MentorshipStatus.PENDING, sessions: [] };
      mentorshipRepositoryMock.findOne.mockResolvedValueOnce(mockMentorship);

      await expect(service.recordSession(mentorshipId, sessionData)).rejects.toThrow('La mentoría no está activa');
      expect(mentorshipRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: mentorshipId } });
      expect(mentorshipRepositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('updateMentorStats', () => {
    const mentorId = 'mentor-id';

    it('should update mentor stats and level based on completed mentorships', async () => {
      const mockMentor = {
        id: mentorId,
        mentorshipRelations: [
          { status: MentorshipStatus.COMPLETED, sessions: [{ rating: 4 }, { rating: 5 }, { rating: 4 }, { rating: 4 }, { rating: 4 }, { rating: 4 }, { rating: 4 }, { rating: 4 }, { rating: 4 }] }, // 9 sessions
          { status: MentorshipStatus.COMPLETED, sessions: [{ rating: 3 }] }, // 1 session
          { status: MentorshipStatus.ACTIVE, sessions: [{ rating: 5 }] }, // Should be ignored
        ],
        stats: { sessionsCompleted: 0, studentsHelped: 0, averageRating: 0, culturalPointsAwarded: 0 },
        level: 'APRENDIZ',
      };
      mentorRepositoryMock.findOne.mockResolvedValueOnce(mockMentor);
      mentorRepositoryMock.save.mockImplementation(data => data);

      await (service as any).updateMentorStats(mentorId);

      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: mentorId },
        relations: ["mentorshipRelations"],
      });
      expect(mockMentor.stats.sessionsCompleted).toBe(10); // 9 + 1
      expect(mockMentor.stats.studentsHelped).toBe(2); // 2 completed mentorships
      expect(mockMentor.stats.averageRating).toBeCloseTo(4.0); // Corregir expectativa a 4.0
      expect(mockMentor.stats.culturalPointsAwarded).toBe(10 * 10); // 10 sessions * 10 points
      // Add expectation for mentor level based on the calculated stats
      expect(mockMentor.level).toBe('intermedio'); // Ajustar expectativa a 'intermedio'
      expect(mentorRepositoryMock.save).toHaveBeenCalledWith(mockMentor);
    });

    it('should update mentor stats and level to MAESTRO', async () => {
      const mockMentor = {
        id: mentorId,
        mentorshipRelations: Array(10).fill({ status: MentorshipStatus.COMPLETED, sessions: Array(5).fill({ rating: 4.0 }) }), // 10 students, 5 sessions each
        stats: { sessionsCompleted: 0, studentsHelped: 0, averageRating: 0, culturalPointsAwarded: 0 },
        level: 'APRENDIZ',
      };
      mentorRepositoryMock.findOne.mockResolvedValueOnce(mockMentor);
      mentorRepositoryMock.save.mockImplementation(data => data);

      await (service as any).updateMentorStats(mentorId);

      expect(mockMentor.stats.sessionsCompleted).toBe(50);
      expect(mockMentor.stats.studentsHelped).toBe(10);
      expect(mockMentor.stats.averageRating).toBeCloseTo(4.0);
      expect(mockMentor.level).toBe('maestro');
      expect(mentorRepositoryMock.save).toHaveBeenCalledWith(mockMentor);
    });

    it('should update mentor stats and level to AVANZADO', async () => {
      const mockMentor = {
        id: mentorId,
        mentorshipRelations: Array(5).fill({ status: MentorshipStatus.COMPLETED, sessions: Array(5).fill({ rating: 3.5 }) }), // 5 students, 5 sessions each
        stats: { sessionsCompleted: 0, studentsHelped: 0, averageRating: 0, culturalPointsAwarded: 0 },
        level: 'APRENDIZ',
      };
      mentorRepositoryMock.findOne.mockResolvedValueOnce(mockMentor);
      mentorRepositoryMock.save.mockImplementation(data => data);

      await (service as any).updateMentorStats(mentorId);

      expect(mockMentor.stats.sessionsCompleted).toBe(25);
      expect(mockMentor.stats.studentsHelped).toBe(5);
      expect(mockMentor.stats.averageRating).toBeCloseTo(3.5);
      expect(mockMentor.level).toBe('avanzado');
      expect(mentorRepositoryMock.save).toHaveBeenCalledWith(mockMentor);
    });

    it('should update mentor stats and level to SABEDOR', async () => {
      const mockMentor = {
        id: mentorId,
        mentorshipRelations: Array(20).fill({ status: MentorshipStatus.COMPLETED, sessions: Array(5).fill({ rating: 4.5 }) }), // 20 students, 5 sessions each
        stats: { sessionsCompleted: 0, studentsHelped: 0, averageRating: 0, culturalPointsAwarded: 0 },
        level: 'APRENDIZ',
      };
      mentorRepositoryMock.findOne.mockResolvedValueOnce(mockMentor);
      mentorRepositoryMock.save.mockImplementation(data => data);

      await (service as any).updateMentorStats(mentorId);

      expect(mockMentor.stats.sessionsCompleted).toBe(100);
      expect(mockMentor.stats.studentsHelped).toBe(20);
      expect(mockMentor.stats.averageRating).toBeCloseTo(4.5);
      expect(mockMentor.level).toBe('sabedor');
      expect(mentorRepositoryMock.save).toHaveBeenCalledWith(mockMentor);
    });

    it('should handle mentor with no completed mentorships', async () => {
      const mockMentor = {
        id: mentorId,
        mentorshipRelations: [{ status: MentorshipStatus.ACTIVE, sessions: [{ rating: 5 }] }],
        stats: { sessionsCompleted: 0, studentsHelped: 0, averageRating: 0, culturalPointsAwarded: 0 },
        level: 'APRENDIZ',
      };
      mentorRepositoryMock.findOne.mockResolvedValueOnce(mockMentor);
      mentorRepositoryMock.save.mockImplementation(data => data);

      await (service as any).updateMentorStats(mentorId);

      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: mentorId },
        relations: ["mentorshipRelations"],
      });
      expect(mockMentor.stats.sessionsCompleted).toBe(0);
      expect(mockMentor.stats.studentsHelped).toBe(0);
      expect(mockMentor.stats.averageRating).toBe(0);
      expect(mockMentor.stats.culturalPointsAwarded).toBe(0);
      expect(mockMentor.level).toBe('APRENDIZ'); // Should remain APRENDIZ
      expect(mentorRepositoryMock.save).toHaveBeenCalledWith(mockMentor);
    });

    it('should throw NotFoundException if mentor is not found', async () => {
      mentorRepositoryMock.findOne.mockResolvedValueOnce(undefined);

      await expect((service as any).updateMentorStats(mentorId)).rejects.toThrow('Mentor no encontrado');
      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: mentorId },
        relations: ["mentorshipRelations"],
      });
      expect(mentorRepositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('getMentorDetails', () => {
    const mentorId = 'mentor-id';

    it('should return mentor details with relations', async () => {
      const mockMentor = {
        id: mentorId,
        userId: 'mentor-user-id',
        specializations: [{ type: 'linguistics' }],
        mentorshipRelations: [{ status: 'ACTIVE' }],
      };
      mentorRepositoryMock.findOne.mockResolvedValueOnce(mockMentor);

      const result = await service.getMentorDetails(mentorId);

      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: mentorId },
        relations: ["specializations", "mentorshipRelations"],
      });
      expect(result).toEqual(mockMentor);
    });

    it('should throw NotFoundException if mentor is not found', async () => {
      mentorRepositoryMock.findOne.mockResolvedValueOnce(undefined);

      await expect(service.getMentorDetails(mentorId)).rejects.toThrow('Mentor no encontrado');
      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: mentorId },
        relations: ["specializations", "mentorshipRelations"],
      });
    });
  });

  describe('getMentorStudents', () => {
    const mentorId = 'mentor-id';

    it('should return mentor students categorized by status', async () => {
      const mockMentorshipRelations = [
        { status: MentorshipStatus.ACTIVE, studentId: 'student-1' },
        { status: MentorshipStatus.COMPLETED, studentId: 'student-2' },
        { status: MentorshipStatus.PENDING, studentId: 'student-3' },
        { status: MentorshipStatus.ACTIVE, studentId: 'student-4' },
      ];
      const mockMentor = { id: mentorId, mentorshipRelations: mockMentorshipRelations };
      mentorRepositoryMock.findOne.mockResolvedValueOnce(mockMentor);

      const result = await service.getMentorStudents(mentorId);

      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: mentorId },
        relations: ["mentorshipRelations"],
      });
      expect(result.active.length).toBe(2);
      expect(result.completed.length).toBe(1);
      expect(result.pending.length).toBe(1);
      expect(result.active.map(rel => rel.studentId)).toEqual(['student-1', 'student-4']);
      expect(result.completed.map(rel => rel.studentId)).toEqual(['student-2']);
      expect(result.pending.map(rel => rel.studentId)).toEqual(['student-3']);
    });

    it('should return empty arrays if mentor has no mentorship relations', async () => {
      const mockMentor = { id: mentorId, mentorshipRelations: [] };
      mentorRepositoryMock.findOne.mockResolvedValueOnce(mockMentor);

      const result = await service.getMentorStudents(mentorId);

      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: mentorId },
        relations: ["mentorshipRelations"],
      });
      expect(result.active).toEqual([]);
      expect(result.completed).toEqual([]);
      expect(result.pending).toEqual([]);
    });

    it('should throw NotFoundException if mentor is not found', async () => {
      mentorRepositoryMock.findOne.mockResolvedValueOnce(undefined);

      await expect(service.getMentorStudents(mentorId)).rejects.toThrow('Mentor no encontrado');
      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({
        where: { id: mentorId },
        relations: ["mentorshipRelations"],
      });
    });
  });

  describe('updateMentorAvailability', () => {
    const mentorId = 'mentor-id';
    const availabilityData = {
      schedule: [{ day: 'lunes', hours: ['09:00', '10:00'] }],
      maxStudents: 10,
    };

    it('should update mentor availability', async () => {
      const mockMentor = { id: mentorId, availability: { schedule: [], maxStudents: 5 } };
      mentorRepositoryMock.findOne.mockResolvedValueOnce(mockMentor);
      mentorRepositoryMock.save.mockImplementation(data => data);

      const result = await service.updateMentorAvailability(mentorId, availabilityData);

      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: mentorId } });
      expect(mockMentor.availability).toEqual(availabilityData);
      expect(mentorRepositoryMock.save).toHaveBeenCalledWith(mockMentor);
      expect(result).toEqual(mockMentor);
    });

    it('should throw NotFoundException if mentor is not found', async () => {
      mentorRepositoryMock.findOne.mockResolvedValueOnce(undefined);

      await expect(service.updateMentorAvailability(mentorId, availabilityData)).rejects.toThrow('Mentor no encontrado');
      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: mentorId } });
      expect(mentorRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid day in schedule', async () => {
      const invalidAvailabilityData = {
        schedule: [{ day: 'invalid-day', hours: ['09:00'] }],
        maxStudents: 10,
      };
      const mockMentor = { id: mentorId, availability: { schedule: [], maxStudents: 5 } };
      mentorRepositoryMock.findOne.mockResolvedValueOnce(mockMentor);

      await expect(service.updateMentorAvailability(mentorId, invalidAvailabilityData)).rejects.toThrow('Día inválido: invalid-day');
      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: mentorId } });
      expect(mentorRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid time format in schedule', async () => {
      const invalidAvailabilityData = {
        schedule: [{ day: 'lunes', hours: ['9:00'] }], // Invalid format
        maxStudents: 10,
      };
      const mockMentor = { id: mentorId, availability: { schedule: [], maxStudents: 5 } };
      mentorRepositoryMock.findOne.mockResolvedValueOnce(mockMentor);

      await expect(service.updateMentorAvailability(mentorId, invalidAvailabilityData)).rejects.toThrow('Formato de hora inválido: 9:00. Use formato HH:MM');
      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: mentorId } });
      expect(mentorRepositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of all mentors with relations', async () => {
      const mockMentors = [
        { id: 'mentor-1', userId: 'user-1', specializations: [], mentorshipRelations: [] },
        { id: 'mentor-2', userId: 'user-2', specializations: [], mentorshipRelations: [] },
      ];
      mentorRepositoryMock.find.mockResolvedValueOnce(mockMentors);

      const result = await service.findAll();

      expect(mentorRepositoryMock.find).toHaveBeenCalledWith({
        relations: ["specializations", "mentorshipRelations"],
      });
      expect(result).toEqual(mockMentors);
    });

    it('should return an empty array if no mentors are found', async () => {
      mentorRepositoryMock.find.mockResolvedValueOnce([]);

      const result = await service.findAll();

      expect(mentorRepositoryMock.find).toHaveBeenCalledWith({
        relations: ["specializations", "mentorshipRelations"],
      });
      expect(result).toEqual([]);
    });
  });

  describe('updateMentorAvailability', () => {
    const mentorId = 'mentor-id';
    const availabilityData = {
      schedule: [{ day: 'lunes', hours: ['09:00', '10:00'] }],
      maxStudents: 10,
    };

    it('should update mentor availability', async () => {
      const mockMentor = { id: mentorId, availability: { schedule: [], maxStudents: 5 } };
      mentorRepositoryMock.findOne.mockResolvedValueOnce(mockMentor);
      mentorRepositoryMock.save.mockImplementation(data => data);

      const result = await service.updateMentorAvailability(mentorId, availabilityData);

      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: mentorId } });
      expect(mockMentor.availability).toEqual(availabilityData);
      expect(mentorRepositoryMock.save).toHaveBeenCalledWith(mockMentor);
      expect(result).toEqual(mockMentor);
    });

    it('should throw NotFoundException if mentor is not found', async () => {
      mentorRepositoryMock.findOne.mockResolvedValueOnce(undefined);

      await expect(service.updateMentorAvailability(mentorId, availabilityData)).rejects.toThrow('Mentor no encontrado');
      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: mentorId } });
      expect(mentorRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid day in schedule', async () => {
      const invalidAvailabilityData = {
        schedule: [{ day: 'invalid-day', hours: ['09:00'] }],
        maxStudents: 10,
      };
      const mockMentor = { id: mentorId, availability: { schedule: [], maxStudents: 5 } };
      mentorRepositoryMock.findOne.mockResolvedValueOnce(mockMentor);

      await expect(service.updateMentorAvailability(mentorId, invalidAvailabilityData)).rejects.toThrow('Día inválido: invalid-day');
      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: mentorId } });
      expect(mentorRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid time format in schedule', async () => {
      const invalidAvailabilityData = {
        schedule: [{ day: 'lunes', hours: ['9:00'] }], // Invalid format
        maxStudents: 10,
      };
      const mockMentor = { id: mentorId, availability: { schedule: [], maxStudents: 5 } };
      mentorRepositoryMock.findOne.mockResolvedValueOnce(mockMentor);

      await expect(service.updateMentorAvailability(mentorId, invalidAvailabilityData)).rejects.toThrow('Formato de hora inválido: 9:00. Use formato HH:MM');
      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: mentorId } });
      expect(mentorRepositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of all mentors with relations', async () => {
      const mockMentors = [
        { id: 'mentor-1', userId: 'user-1', specializations: [], mentorshipRelations: [] },
        { id: 'mentor-2', userId: 'user-2', specializations: [], mentorshipRelations: [] },
      ];
      mentorRepositoryMock.find.mockResolvedValueOnce(mockMentors);

      const result = await service.findAll();

      expect(mentorRepositoryMock.find).toHaveBeenCalledWith({
        relations: ["specializations", "mentorshipRelations"],
      });
      expect(result).toEqual(mockMentors);
    });

    it('should return an empty array if no mentors are found', async () => {
      mentorRepositoryMock.find.mockResolvedValueOnce([]);

      const result = await service.findAll();

      expect(mentorRepositoryMock.find).toHaveBeenCalledWith({
        relations: ["specializations", "mentorshipRelations"],
      });
      expect(result).toEqual([]);
    });
  });

  describe('updateMentorAvailability', () => {
    const mentorId = 'mentor-id';
    const availabilityData = {
      schedule: [{ day: 'lunes', hours: ['09:00', '10:00'] }],
      maxStudents: 10,
    };

    it('should update mentor availability', async () => {
      const mockMentor = { id: mentorId, availability: { schedule: [], maxStudents: 5 } };
      mentorRepositoryMock.findOne.mockResolvedValueOnce(mockMentor);
      mentorRepositoryMock.save.mockImplementation(data => data);

      const result = await service.updateMentorAvailability(mentorId, availabilityData);

      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: mentorId } });
      expect(mockMentor.availability).toEqual(availabilityData);
      expect(mentorRepositoryMock.save).toHaveBeenCalledWith(mockMentor);
      expect(result).toEqual(mockMentor);
    });

    it('should throw NotFoundException if mentor is not found', async () => {
      mentorRepositoryMock.findOne.mockResolvedValueOnce(undefined);

      await expect(service.updateMentorAvailability(mentorId, availabilityData)).rejects.toThrow('Mentor no encontrado');
      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: mentorId } });
      expect(mentorRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid day in schedule', async () => {
      const invalidAvailabilityData = {
        schedule: [{ day: 'invalid-day', hours: ['09:00'] }],
        maxStudents: 10,
      };
      const mockMentor = { id: mentorId, availability: { schedule: [], maxStudents: 5 } };
      mentorRepositoryMock.findOne.mockResolvedValueOnce(mockMentor);

      await expect(service.updateMentorAvailability(mentorId, invalidAvailabilityData)).rejects.toThrow('Día inválido: invalid-day');
      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: mentorId } });
      expect(mentorRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid time format in schedule', async () => {
      const invalidAvailabilityData = {
        schedule: [{ day: 'lunes', hours: ['9:00'] }], // Invalid format
        maxStudents: 10,
      };
      const mockMentor = { id: mentorId, availability: { schedule: [], maxStudents: 5 } };
      mentorRepositoryMock.findOne.mockResolvedValueOnce(mockMentor);

      await expect(service.updateMentorAvailability(mentorId, invalidAvailabilityData)).rejects.toThrow('Formato de hora inválido: 9:00. Use formato HH:MM');
      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: mentorId } });
      expect(mentorRepositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of all mentors with relations', async () => {
      const mockMentors = [
        { id: 'mentor-1', userId: 'user-1', specializations: [], mentorshipRelations: [] },
        { id: 'mentor-2', userId: 'user-2', specializations: [], mentorshipRelations: [] },
      ];
      mentorRepositoryMock.find.mockResolvedValueOnce(mockMentors);

      const result = await service.findAll();

      expect(mentorRepositoryMock.find).toHaveBeenCalledWith({
        relations: ["specializations", "mentorshipRelations"],
      });
      expect(result).toEqual(mockMentors);
    });

    it('should return an empty array if no mentors are found', async () => {
      mentorRepositoryMock.find.mockResolvedValueOnce([]);

      const result = await service.findAll();

      expect(mentorRepositoryMock.find).toHaveBeenCalledWith({
        relations: ["specializations", "mentorshipRelations"],
      });
      expect(result).toEqual([]);
    });
  });

  describe('updateMentorAvailability', () => {
    const mentorId = 'mentor-id';
    const availabilityData = {
      schedule: [{ day: 'lunes', hours: ['09:00', '10:00'] }],
      maxStudents: 10,
    };

    it('should update mentor availability', async () => {
      const mockMentor = { id: mentorId, availability: { schedule: [], maxStudents: 5 } };
      mentorRepositoryMock.findOne.mockResolvedValueOnce(mockMentor);
      mentorRepositoryMock.save.mockImplementation(data => data);

      const result = await service.updateMentorAvailability(mentorId, availabilityData);

      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: mentorId } });
      expect(mockMentor.availability).toEqual(availabilityData);
      expect(mentorRepositoryMock.save).toHaveBeenCalledWith(mockMentor);
      expect(result).toEqual(mockMentor);
    });

    it('should throw NotFoundException if mentor is not found', async () => {
      mentorRepositoryMock.findOne.mockResolvedValueOnce(undefined);

      await expect(service.updateMentorAvailability(mentorId, availabilityData)).rejects.toThrow('Mentor no encontrado');
      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: mentorId } });
      expect(mentorRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid day in schedule', async () => {
      const invalidAvailabilityData = {
        schedule: [{ day: 'invalid-day', hours: ['09:00'] }],
        maxStudents: 10,
      };
      const mockMentor = { id: mentorId, availability: { schedule: [], maxStudents: 5 } };
      mentorRepositoryMock.findOne.mockResolvedValueOnce(mockMentor);

      await expect(service.updateMentorAvailability(mentorId, invalidAvailabilityData)).rejects.toThrow('Día inválido: invalid-day');
      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: mentorId } });
      expect(mentorRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid time format in schedule', async () => {
      const invalidAvailabilityData = {
        schedule: [{ day: 'lunes', hours: ['9:00'] }], // Invalid format
        maxStudents: 10,
      };
      const mockMentor = { id: mentorId, availability: { schedule: [], maxStudents: 5 } };
      mentorRepositoryMock.findOne.mockResolvedValueOnce(mockMentor);

      await expect(service.updateMentorAvailability(mentorId, invalidAvailabilityData)).rejects.toThrow('Formato de hora inválido: 9:00. Use formato HH:MM');
      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: mentorId } });
      expect(mentorRepositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of all mentors with relations', async () => {
      const mockMentors = [
        { id: 'mentor-1', userId: 'user-1', specializations: [], mentorshipRelations: [] },
        { id: 'mentor-2', userId: 'user-2', specializations: [], mentorshipRelations: [] },
      ];
      mentorRepositoryMock.find.mockResolvedValueOnce(mockMentors);

      const result = await service.findAll();

      expect(mentorRepositoryMock.find).toHaveBeenCalledWith({
        relations: ["specializations", "mentorshipRelations"],
      });
      expect(result).toEqual(mockMentors);
    });

    it('should return an empty array if no mentors are found', async () => {
      mentorRepositoryMock.find.mockResolvedValueOnce([]);

      const result = await service.findAll();

      expect(mentorRepositoryMock.find).toHaveBeenCalledWith({
        relations: ["specializations", "mentorshipRelations"],
      });
      expect(result).toEqual([]);
    });
  });

  describe('updateMentorAvailability', () => {
    const mentorId = 'mentor-id';
    const availabilityData = {
      schedule: [{ day: 'lunes', hours: ['09:00', '10:00'] }],
      maxStudents: 10,
    };

    it('should update mentor availability', async () => {
      const mockMentor = { id: mentorId, availability: { schedule: [], maxStudents: 5 } };
      mentorRepositoryMock.findOne.mockResolvedValueOnce(mockMentor);
      mentorRepositoryMock.save.mockImplementation(data => data);

      const result = await service.updateMentorAvailability(mentorId, availabilityData);

      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: mentorId } });
      expect(mockMentor.availability).toEqual(availabilityData);
      expect(mentorRepositoryMock.save).toHaveBeenCalledWith(mockMentor);
      expect(result).toEqual(mockMentor);
    });

    it('should throw NotFoundException if mentor is not found', async () => {
      mentorRepositoryMock.findOne.mockResolvedValueOnce(undefined);

      await expect(service.updateMentorAvailability(mentorId, availabilityData)).rejects.toThrow('Mentor no encontrado');
      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: mentorId } });
      expect(mentorRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid day in schedule', async () => {
      const invalidAvailabilityData = {
        schedule: [{ day: 'invalid-day', hours: ['09:00'] }],
        maxStudents: 10,
      };
      const mockMentor = { id: mentorId, availability: { schedule: [], maxStudents: 5 } };
      mentorRepositoryMock.findOne.mockResolvedValueOnce(mockMentor);

      await expect(service.updateMentorAvailability(mentorId, invalidAvailabilityData)).rejects.toThrow('Día inválido: invalid-day');
      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: mentorId } });
      expect(mentorRepositoryMock.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid time format in schedule', async () => {
      const invalidAvailabilityData = {
        schedule: [{ day: 'lunes', hours: ['9:00'] }], // Invalid format
        maxStudents: 10,
      };
      const mockMentor = { id: mentorId, availability: { schedule: [], maxStudents: 5 } };
      mentorRepositoryMock.findOne.mockResolvedValueOnce(mockMentor);

      await expect(service.updateMentorAvailability(mentorId, invalidAvailabilityData)).rejects.toThrow('Formato de hora inválido: 9:00. Use formato HH:MM');
      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({ where: { id: mentorId } });
      expect(mentorRepositoryMock.save).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return an array of all mentors with relations', async () => {
      const mockMentors = [
        { id: 'mentor-1', userId: 'user-1', specializations: [], mentorshipRelations: [] },
        { id: 'mentor-2', userId: 'user-2', specializations: [], mentorshipRelations: [] },
      ];
      mentorRepositoryMock.find.mockResolvedValueOnce(mockMentors);

      const result = await service.findAll();

      expect(mentorRepositoryMock.find).toHaveBeenCalledWith({
        relations: ["specializations", "mentorshipRelations"],
      });
      expect(result).toEqual(mockMentors);
    });

    it('should return an empty array if no mentors are found', async () => {
      mentorRepositoryMock.find.mockResolvedValueOnce([]);

      const result = await service.findAll();

      expect(mentorRepositoryMock.find).toHaveBeenCalledWith({
        relations: ["specializations", "mentorshipRelations"],
      });
      expect(result).toEqual([]);
    });
  });

  describe('createMentor', () => {
    const userId = 'test-user-id';
    const initialSpecializations = [
      { type: 'linguistics' as any, level: 5, description: 'Expert in linguistics' },
      { type: 'culture' as any, level: 4, description: 'Knowledgeable in culture' },
    ];

    it('should create a new mentor and initial specializations if user is not already a mentor', async () => {
      mentorRepositoryMock.findOne.mockResolvedValue(undefined); // User is not a mentor
      const createdMentor = { id: 'new-mentor-id', userId, level: 'APRENDIZ', stats: {}, availability: {}, achievements: [] };
      mentorRepositoryMock.create.mockReturnValue(createdMentor);
      mentorRepositoryMock.save.mockResolvedValue(createdMentor);
      specializationRepositoryMock.create.mockImplementation(specData => specData);
      specializationRepositoryMock.save.mockResolvedValue({});

      const result = await service.createMentor(userId, initialSpecializations);

      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({ where: { userId } });
      expect(mentorRepositoryMock.create).toHaveBeenCalledWith({
        userId,
        level: 'aprendiz', // Ajustar expectativa a 'aprendiz'
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
        achievements: [],
      });
      expect(mentorRepositoryMock.save).toHaveBeenCalledWith(createdMentor);
      expect(specializationRepositoryMock.create).toHaveBeenCalledTimes(initialSpecializations.length);
      expect(specializationRepositoryMock.save).toHaveBeenCalledTimes(initialSpecializations.length);
      expect(result).toEqual(createdMentor);
    });

    it('should throw BadRequestException if user is already a mentor', async () => {
      const existingMentor = { id: 'existing-mentor-id', userId };
      mentorRepositoryMock.findOne.mockResolvedValue(existingMentor); // User is already a mentor

      await expect(service.createMentor(userId, initialSpecializations)).rejects.toThrow(BadRequestException);
      expect(mentorRepositoryMock.findOne).toHaveBeenCalledWith({ where: { userId } });
      expect(mentorRepositoryMock.create).not.toHaveBeenCalled();
      expect(specializationRepositoryMock.create).not.toHaveBeenCalled();
      expect(specializationRepositoryMock.save).not.toHaveBeenCalled();
    });
  });
});
