import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EvaluationRewardService } from './evaluation-reward.service';
import { MissionService } from './mission.service';
import { Gamification } from '../entities/gamification.entity';
import { MissionType } from '../entities/mission.entity';
import { GamificationService } from './gamification.service';
import { UserActivityRepository } from '../../activity/repositories/user-activity.repository'; // Importar UserActivityRepository

describe('EvaluationRewardService', () => {
  let service: EvaluationRewardService;
  let gamificationRepository: MockRepository;
  let missionService: MockMissionService;
  let gamificationService: GamificationService; // Declarar gamificationService con su tipo
  let userActivityRepository: UserActivityRepository; // Declarar UserActivityRepository

  // Mock del repositorio de TypeORM
  const mockRepository = () => ({
    findOne: jest.fn(),
    save: jest.fn(),
  });

  // Mock del MissionService
  const mockMissionService = () => ({
    updateMissionProgress: jest.fn(),
  });

  // Mock del GamificationService
  const mockGamificationService = {
    findByUserId: jest.fn(),
    awardPoints: jest.fn(),
    // Añadir otros métodos de GamificationService usados por EvaluationRewardService si es necesario
  };

  // Mock del UserActivityRepository
  const mockUserActivityRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  };

  type MockRepository = Partial<Record<keyof Repository<Gamification>, jest.Mock>>;
  type MockMissionService = Partial<Record<keyof MissionService, jest.Mock>>;


  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationRewardService,
        {
          provide: getRepositoryToken(Gamification),
          useFactory: mockRepository,
        },
        {
          provide: MissionService,
          useFactory: mockMissionService,
        },
        {
          provide: GamificationService, // Proveer mock para GamificationService
          useValue: mockGamificationService,
        },
        {
          provide: UserActivityRepository, // Proveer mock para UserActivityRepository
          useValue: mockUserActivityRepository,
        },
      ],
    }).compile();

    service = module.get<EvaluationRewardService>(EvaluationRewardService);
    gamificationRepository = module.get<MockRepository>(getRepositoryToken(Gamification));
    missionService = module.get<MockMissionService>(MissionService);
    gamificationService = module.get<GamificationService>(GamificationService); // Obtener GamificationService
    userActivityRepository = module.get<UserActivityRepository>(UserActivityRepository); // Obtener UserActivityRepository
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleEvaluationCompletion', () => {
    const userId = 'test-user-id';
    // Create a fresh initialGamification object for each test
    const createInitialGamification = () => ({
      userId,
      experience: 0,
      level: 1,
      nextLevelExperience: 100,
      points: 0,
      stats: { lessonsCompleted: 0, exercisesCompleted: 0, perfectScores: 0, culturalContributions: 0 }, // Actualizar stats
      recentActivities: [],
    } as Gamification); // Cast to Gamification type

    it('should not update gamification if user is not found', async () => {
      gamificationRepository.findOne.mockResolvedValue(undefined);

      await service.handleEvaluationCompletion(userId, 10, 10);

      expect(gamificationRepository.findOne).toHaveBeenCalledWith({ where: { userId } });
      expect(gamificationRepository.save).not.toHaveBeenCalled();
      expect(missionService.updateMissionProgress).not.toHaveBeenCalled();
    });

    it('should update stats, experience, points, and activities for a successful evaluation', async () => {
      const score = 8;
      const totalQuestions = 10;
      const percentage = (score / totalQuestions) * 100;
      const baseExperience = 50;
      const bonusExperience = Math.floor(percentage / 10) * 5;
      const totalExperience = baseExperience + bonusExperience;

      const gamification = createInitialGamification();
      gamificationRepository.findOne.mockResolvedValue(gamification);

      await service.handleEvaluationCompletion(userId, score, totalQuestions);

      expect(gamificationRepository.findOne).toHaveBeenCalledWith({ where: { userId } });
      expect(gamification.stats.exercisesCompleted).toBe(1);
      expect(gamification.stats.perfectScores).toBe(0); // Not a perfect score
      expect(gamification.experience).toBe(totalExperience);
      expect(gamification.points).toBe(totalExperience);
      expect(gamification.recentActivities.length).toBe(1);
      expect(gamification.recentActivities[0].type).toBe('evaluation_completed');
      expect(gamification.recentActivities[0].description).toContain(`${score}/${totalQuestions}`);
      expect(gamification.recentActivities[0].pointsEarned).toBe(totalExperience);
      expect(gamificationRepository.save).toHaveBeenCalledWith(gamification);
      expect(missionService.updateMissionProgress).toHaveBeenCalledWith(
        userId,
        MissionType.PRACTICE_EXERCISES,
        gamification.stats.exercisesCompleted
      );
      // Should not call updateMissionProgress for perfect scores
      expect(missionService.updateMissionProgress).not.toHaveBeenCalledWith(
        userId,
        MissionType.PRACTICE_EXERCISES,
        gamification.stats.perfectScores
      );
    });

    it('should update stats, experience, points, activities, and perfect score mission for a perfect evaluation', async () => {
      const score = 10;
      const totalQuestions = 10;
      const percentage = (score / totalQuestions) * 100;
      const baseExperience = 50;
      const bonusExperience = Math.floor(percentage / 10) * 5;
      const totalExperience = baseExperience + bonusExperience; // Should be 100

      const gamification = createInitialGamification();
      gamificationRepository.findOne.mockResolvedValue(gamification);

      await service.handleEvaluationCompletion(userId, score, totalQuestions);

      expect(gamificationRepository.findOne).toHaveBeenCalledWith({ where: { userId } });
      expect(gamification.stats.exercisesCompleted).toBe(1); // Corrected expectation
      expect(gamification.stats.perfectScores).toBe(1); // Perfect score
      expect(gamification.experience).toBe(0); // Corrected expectation: experience is reset after level up
      expect(gamification.points).toBe(totalExperience);
      expect(gamification.recentActivities.length).toBe(2); // Corrected expectation: evaluation_completed + level_up
      expect(gamification.recentActivities[0].type).toBe('evaluation_completed');
      expect(gamification.recentActivities[0].description).toContain(`${score}/${totalQuestions}`);
      expect(gamification.recentActivities[0].pointsEarned).toBe(totalExperience);
      expect(gamification.recentActivities[1].type).toBe('level_up'); // Added expectation for level_up activity
      expect(gamification.recentActivities[1].description).toContain('¡Subió al nivel'); // Added expectation for level_up description
      expect(gamification.recentActivities[1].pointsEarned).toBe(0); // Added expectation for level_up points
      expect(gamificationRepository.save).toHaveBeenCalledWith(gamification);
      expect(missionService.updateMissionProgress).toHaveBeenCalledWith(
        userId,
        MissionType.PRACTICE_EXERCISES,
        gamification.stats.exercisesCompleted
      );
      // Should call updateMissionProgress for perfect scores
      expect(missionService.updateMissionProgress).toHaveBeenCalledWith(
        userId,
        MissionType.PRACTICE_EXERCISES,
        gamification.stats.perfectScores
      );
    });

    it('should update experience, points, and level up if enough experience is gained', async () => {
      const score = 10;
      const totalQuestions = 10;
      const percentage = (score / totalQuestions) * 100;
      const baseExperience = 50;
      const bonusExperience = Math.floor(percentage / 10) * 5;
      const totalExperience = baseExperience + bonusExperience; // Should be 100

      const gamification = { ...createInitialGamification(), experience: 50, nextLevelExperience: 100 }; // Needs 50 more for level up
      gamificationRepository.findOne.mockResolvedValue(gamification);

      await service.handleEvaluationCompletion(userId, score, totalQuestions);

      expect(gamificationRepository.findOne).toHaveBeenCalledWith({ where: { userId } });
      // Expect experience to be initial experience + totalExperience gained - nextLevelExperience (due to level up)
      expect(gamification.experience).toBe(50 + totalExperience - 100); // Corrected calculation based on initial state
      // Expect points to be initial points + totalExperience gained, as per service logic
      expect(gamification.points).toBe(createInitialGamification().points + totalExperience);
      expect(gamification.level).toBe(2);
      expect(gamification.nextLevelExperience).toBe(Math.floor(100 * 1.5)); // New next level experience
      // Expect recentActivities length to be 2 (evaluation completed + level up)
      expect(gamification.recentActivities.length).toBe(2);
      expect(gamification.recentActivities[0].type).toBe('evaluation_completed'); // Corrected expectation
      expect(gamification.recentActivities[0].description).toContain(`${score}/${totalQuestions}`); // Corrected expectation
      expect(gamification.recentActivities[0].pointsEarned).toBe(totalExperience); // Corrected expectation
      expect(gamification.recentActivities[1].type).toBe('level_up'); // Corrected expectation
      expect(gamification.recentActivities[1].description).toContain('¡Subió al nivel 2!'); // Corrected expectation
      expect(gamification.recentActivities[1].pointsEarned).toBe(0); // Corrected expectation
      expect(gamificationRepository.save).toHaveBeenCalledWith(gamification);
      expect(missionService.updateMissionProgress).toHaveBeenCalledWith(
        userId,
        MissionType.PRACTICE_EXERCISES,
        gamification.stats.exercisesCompleted
      );
      expect(missionService.updateMissionProgress).toHaveBeenCalledWith(
        userId,
        MissionType.PRACTICE_EXERCISES,
        gamification.stats.perfectScores
      );
    });
  });
});
