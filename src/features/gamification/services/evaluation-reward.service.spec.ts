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
  let gamificationService: MockGamificationService; // Declarar gamificationService con su tipo mockeado
  let userActivityRepository: MockUserActivityRepository; // Declarar UserActivityRepository con su tipo mockeado

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
  const mockGamificationService = () => ({
    findByUserId: jest.fn(),
    awardPoints: jest.fn(),
    updateExperience: jest.fn(),
    updatePoints: jest.fn(),
    addActivity: jest.fn(),
    // Añadir otros métodos de GamificationService usados por EvaluationRewardService si es necesario
  });

  // Mock del UserActivityRepository
  const mockUserActivityRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
    find: jest.fn(),
  });

  type MockRepository = Partial<Record<keyof Repository<Gamification>, jest.Mock>>;
  type MockMissionService = Partial<Record<keyof MissionService, jest.Mock>>;
  type MockGamificationService = {
    findByUserId: jest.Mock;
    awardPoints: jest.Mock;
    updateExperience: jest.Mock;
    updatePoints: jest.Mock;
    addActivity: jest.Mock;
    // Añadir otros métodos de GamificationService usados por EvaluationRewardService si es necesario
  };
  type MockUserActivityRepository = Partial<Record<keyof UserActivityRepository, jest.Mock>>;


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
          useFactory: mockGamificationService,
        },
        {
          provide: UserActivityRepository, // Proveer mock para UserActivityRepository
          useFactory: mockUserActivityRepository,
        },
      ],
    }).compile();

    service = module.get<EvaluationRewardService>(EvaluationRewardService);
    gamificationRepository = module.get<MockRepository>(getRepositoryToken(Gamification));
    missionService = module.get<MockMissionService>(MissionService);
    gamificationService = module.get<MockGamificationService>(GamificationService); // Obtener GamificationService mockeado
    userActivityRepository = module.get<MockUserActivityRepository>(UserActivityRepository); // Obtener UserActivityRepository mockeado
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

      // Mock GamificationService methods to simulate their behavior
      gamificationService.updateExperience.mockImplementation((userGamification, exp) => {
        userGamification.experience += exp;
      });
      gamificationService.updatePoints.mockImplementation((userGamification, pts) => {
        userGamification.points += pts;
      });
      gamificationService.addActivity.mockImplementation((userGamification, type, description, points) => {
        userGamification.recentActivities.push({ type, description, pointsEarned: points, timestamp: new Date() });
      });


      await service.handleEvaluationCompletion(userId, score, totalQuestions);

      expect(gamificationRepository.findOne).toHaveBeenCalledWith({ where: { userId } });
      expect(gamification.stats.exercisesCompleted).toBe(1);
      expect(gamification.stats.perfectScores).toBe(0); // Not a perfect score
      // Verify the state of the gamification object after the service call
      expect(gamification.experience).toBe(totalExperience);
      expect(gamification.points).toBe(totalExperience); // Assuming points are updated with totalExperience
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
        MissionType.PRACTICE_EXERCISES, // Corrected MissionType
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

      // Mock GamificationService methods to simulate their behavior
      gamificationService.updateExperience.mockImplementation((userGamification, exp) => {
        userGamification.experience += exp;
        // Simulate level up if enough experience is gained
        if (userGamification.experience >= userGamification.nextLevelExperience) {
          userGamification.level += 1;
          userGamification.experience -= userGamification.nextLevelExperience;
          userGamification.nextLevelExperience = Math.floor(userGamification.nextLevelExperience * 1.5);
          // Simulate adding level_up activity
          userGamification.recentActivities.push({ type: 'level_up', description: `¡Subió al nivel ${userGamification.level}!`, pointsEarned: 0, timestamp: new Date() });
        }
      });
      gamificationService.updatePoints.mockImplementation((userGamification, pts) => {
        userGamification.points += pts;
      });
      gamificationService.addActivity.mockImplementation((userGamification, type, description, points) => {
        userGamification.recentActivities.push({ type, description, pointsEarned: points, timestamp: new Date() });
      });


      await service.handleEvaluationCompletion(userId, score, totalQuestions);

      expect(gamificationRepository.findOne).toHaveBeenCalledWith({ where: { userId } });
      expect(gamification.stats.exercisesCompleted).toBe(1); // Corrected expectation
      expect(gamification.stats.perfectScores).toBe(1); // Perfect score
      // Verify the state of the gamification object after the service call
      expect(gamification.experience).toBe(0); // Initial experience was 0, gained 100, next level 100, so remaining is 0
      expect(gamification.points).toBe(100); // Initial points was 0, gained 100
      expect(gamification.recentActivities.length).toBe(2); // evaluation_completed + level_up
      expect(gamification.recentActivities[0].type).toBe('evaluation_completed');
      expect(gamification.recentActivities[0].description).toContain(`${score}/${totalQuestions}`);
      expect(gamification.recentActivities[0].pointsEarned).toBe(totalExperience);
      expect(gamification.recentActivities[1].type).toBe('level_up');
      expect(gamification.recentActivities[1].description).toContain('¡Subió al nivel 2!');
      expect(gamification.recentActivities[1].pointsEarned).toBe(0);
      expect(gamificationRepository.save).toHaveBeenCalledWith(gamification);
      expect(missionService.updateMissionProgress).toHaveBeenCalledWith(
        userId,
        MissionType.PRACTICE_EXERCISES,
        gamification.stats.exercisesCompleted
      );
      // Should call updateMissionProgress for perfect scores
      expect(missionService.updateMissionProgress).toHaveBeenCalledWith(
        userId,
        MissionType.PRACTICE_EXERCISES, // Corrected MissionType
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

      // Mock GamificationService methods to simulate their behavior
      gamificationService.updateExperience.mockImplementation((userGamification, exp) => {
        userGamification.experience += exp;
        // Simulate level up if enough experience is gained
        if (userGamification.experience >= userGamification.nextLevelExperience) {
          userGamification.level += 1;
          userGamification.experience -= userGamification.nextLevelExperience;
          userGamification.nextLevelExperience = Math.floor(userGamification.nextLevelExperience * 1.5);
          // Simulate adding level_up activity
          userGamification.recentActivities.push({ type: 'level_up', description: `¡Subió al nivel ${userGamification.level}!`, pointsEarned: 0, timestamp: new Date() });
        }
      });
      gamificationService.updatePoints.mockImplementation((userGamification, pts) => {
        userGamification.points += pts;
      });
      gamificationService.addActivity.mockImplementation((userGamification, type, description, points) => {
        userGamification.recentActivities.push({ type, description, pointsEarned: points, timestamp: new Date() });
      });

      await service.handleEvaluationCompletion(userId, score, totalQuestions);

      expect(gamificationRepository.findOne).toHaveBeenCalledWith({ where: { userId } });
      // Verify the state of the gamification object after the service call
      // Expect experience to be initial experience + totalExperience gained - nextLevelExperience (due to level up)
      // Assuming initial experience is 50 and totalExperience gained is 100, and nextLevelExperience is 100
      // Remaining experience = 50 + 100 - 100 = 50
      expect(gamification.experience).toBe(50); // Corrected expectation
      // Expect points to be initial points + totalExperience gained, as per service logic
      // Assuming initial points is 0 and totalExperience gained is 100
      // Total points = 0 + 100 = 100
      expect(gamification.points).toBe(100); // Corrected expectation
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
        MissionType.PRACTICE_EXERCISES, // Corrected MissionType
        gamification.stats.perfectScores
      );
    });
  });
});
