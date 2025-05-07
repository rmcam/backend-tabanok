import { Test, TestingModule } from '@nestjs/testing';
import { MissionService } from './mission.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mission, MissionType } from '../entities'; // Import MissionType
import { Gamification } from '../entities/gamification.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('MissionService', () => {
  let service: MissionService;
  let missionRepository: Repository<Mission>;
  let gamificationRepository: Repository<Gamification>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MissionService,
        {
          provide: getRepositoryToken(Mission),
          useValue: {
            // Mock methods used in MissionService
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(), // Added find method mock
            remove: jest.fn(), // Added remove method mock
            // Add other necessary mock methods here
          },
        },
        {
          provide: getRepositoryToken(Gamification),
          useValue: {
            // Mock methods used in MissionService
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            // Add other necessary mock methods here
          },
        },
      ],
    }).compile();

    service = module.get<MissionService>(MissionService);
    missionRepository = module.get<Repository<Mission>>(getRepositoryToken(Mission));
    gamificationRepository = module.get<Repository<Gamification>>(getRepositoryToken(Gamification));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createMission', () => {
    it('should create a new mission', async () => {
      const createMissionDto = {
        name: 'Test Mission',
        description: 'A test mission',
        type: MissionType.COMPLETE_LESSONS, // Corrected mission type
        reward: { id: 1, name: 'Points', value: 10 }, // Assuming Reward structure
        criteria: { type: 'completion', target: 1 }, // Assuming Criteria structure
        startDate: new Date(),
        endDate: new Date(),
      };
      const expectedMission = { id: 1, ...createMissionDto };

      jest.spyOn(missionRepository, 'create').mockReturnValue(expectedMission as any);
      jest.spyOn(missionRepository, 'save').mockResolvedValue(expectedMission as any);

      const result = await service.createMission(createMissionDto as any);

      expect(missionRepository.create).toHaveBeenCalledWith(createMissionDto);
      expect(missionRepository.save).toHaveBeenCalledWith(expectedMission);
      expect(result).toEqual(expectedMission);
    });
  });

  describe('findOne', () => {
    it('should return a single mission by id', async () => {
      const missionId = 'test-mission-id';
      const expectedMission = { id: missionId, name: 'Test Mission' };
      jest.spyOn(missionRepository, 'findOne').mockResolvedValue(expectedMission as any);

      const result = await service.findOne(missionId);

      expect(missionRepository.findOne).toHaveBeenCalledWith({ where: { id: missionId } });
      expect(result).toEqual(expectedMission);
    });
  });

  describe('getActiveMissions', () => {
    it('should return an array of active missions', async () => {
      const expectedMissions = [{ id: 1, name: 'Mission 1' }, { id: 2, name: 'Mission 2' }];
      jest.spyOn(missionRepository, 'find').mockResolvedValue(expectedMissions as any);

      // Assuming getActiveMissions takes a userId and optional type
      const userId = 'test-user-id';
      const result = await service.getActiveMissions(userId);

      // The find method in the service uses a 'where' clause with dates and potentially type
      // We can't easily mock the exact 'where' clause here without more context,
      // but we can assert that find was called.
      expect(missionRepository.find).toHaveBeenCalled();
      expect(result).toEqual(expectedMissions);
    });
  });

  describe('updateMissionProgress', () => {
    let getActiveMissionsSpy: jest.SpyInstance;
    let awardMissionRewardsSpy: jest.SpyInstance;

    beforeEach(() => {
      getActiveMissionsSpy = jest.spyOn(service, 'getActiveMissions');
      awardMissionRewardsSpy = jest.spyOn(service as any, 'awardMissionRewards').mockResolvedValue(undefined);
    });

    it('should update progress for existing user progress', async () => {
      const userId = 'user-id';
      const missionType = MissionType.COMPLETE_LESSONS;
      const progress = 3;
      const mockMission = {
        id: 'mission-1',
        type: missionType,
        targetValue: 5,
        completedBy: [{ userId: userId, progress: 1, completedAt: null }],
      };
      getActiveMissionsSpy.mockResolvedValue([mockMission]);
      jest.spyOn(missionRepository, 'save').mockResolvedValue(mockMission as any);

      await service.updateMissionProgress(userId, missionType, progress);

      expect(getActiveMissionsSpy).toHaveBeenCalledWith(userId);
      expect(mockMission.completedBy[0].progress).toBe(progress);
      expect(missionRepository.save).toHaveBeenCalledWith(mockMission);
      expect(awardMissionRewardsSpy).not.toHaveBeenCalled();
    });

    it('should create new user progress if none exists', async () => {
      const userId = 'user-id';
      const missionType = MissionType.COMPLETE_LESSONS;
      const progress = 2;
      const mockMission = {
        id: 'mission-1',
        type: missionType,
        targetValue: 5,
        completedBy: [],
      };
      getActiveMissionsSpy.mockResolvedValue([mockMission]);
      jest.spyOn(missionRepository, 'save').mockResolvedValue(mockMission as any);

      await service.updateMissionProgress(userId, missionType, progress);

      expect(getActiveMissionsSpy).toHaveBeenCalledWith(userId);
      expect(mockMission.completedBy.length).toBe(1);
      expect(mockMission.completedBy[0].userId).toBe(userId);
      expect(mockMission.completedBy[0].progress).toBe(progress);
      expect(mockMission.completedBy[0].completedAt).toBeNull();
      expect(missionRepository.save).toHaveBeenCalledWith(mockMission);
      expect(awardMissionRewardsSpy).not.toHaveBeenCalled();
    });

    it('should mark mission as completed and award rewards if target is met', async () => {
      const userId = 'user-id';
      const missionType = MissionType.COMPLETE_LESSONS;
      const progress = 5;
      const mockMission = {
        id: 'mission-1',
        type: missionType,
        targetValue: 5,
        rewardPoints: 100,
        completedBy: [{ userId: userId, progress: 4, completedAt: null }],
      };
      getActiveMissionsSpy.mockResolvedValue([mockMission]);
      jest.spyOn(missionRepository, 'save').mockResolvedValue(mockMission as any);

      await service.updateMissionProgress(userId, missionType, progress);

      expect(getActiveMissionsSpy).toHaveBeenCalledWith(userId);
      expect(mockMission.completedBy[0].progress).toBe(progress);
      expect(mockMission.completedBy[0].completedAt).toBeInstanceOf(Date);
      expect(missionRepository.save).toHaveBeenCalledWith(mockMission);
      expect(awardMissionRewardsSpy).toHaveBeenCalledWith(userId, mockMission);
    });

    it('should not award rewards if mission is already completed', async () => {
      const userId = 'user-id';
      const missionType = MissionType.COMPLETE_LESSONS;
      const progress = 6;
      const mockMission = {
        id: 'mission-1',
        type: missionType,
        targetValue: 5,
        rewardPoints: 100,
        completedBy: [{ userId: userId, progress: 5, completedAt: new Date() }],
      };
      getActiveMissionsSpy.mockResolvedValue([mockMission]);
      jest.spyOn(missionRepository, 'save').mockResolvedValue(mockMission as any);

      await service.updateMissionProgress(userId, missionType, progress);

      expect(getActiveMissionsSpy).toHaveBeenCalledWith(userId);
      expect(mockMission.completedBy[0].progress).toBe(progress); // Progress should still update
      expect(awardMissionRewardsSpy).not.toHaveBeenCalled();
      expect(missionRepository.save).toHaveBeenCalledWith(mockMission);
    });

    it('should handle different mission types correctly', async () => {
      const userId = 'user-id';
      const progress = 1;
      const mockMission1 = {
        id: 'mission-1',
        type: MissionType.CULTURAL_CONTENT,
        targetValue: 3,
        completedBy: [],
      };
      const mockMission2 = {
        id: 'mission-2',
        type: MissionType.COMMUNITY_INTERACTION,
        targetValue: 2,
        completedBy: [],
      };
      getActiveMissionsSpy.mockResolvedValue([mockMission1, mockMission2]);
      jest.spyOn(missionRepository, 'save').mockResolvedValue({} as any);

      await service.updateMissionProgress(userId, MissionType.CULTURAL_CONTENT, progress);

      expect(mockMission1.completedBy.length).toBe(1);
      expect(mockMission1.completedBy[0].progress).toBe(progress);
      expect(mockMission2.completedBy.length).toBe(1); // Progress should be updated for all active missions of the specified type
      expect(mockMission2.completedBy[0].progress).toBe(progress);
      expect(missionRepository.save).toHaveBeenCalledTimes(2);
      expect(awardMissionRewardsSpy).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException for unknown mission type during progress update', async () => {
      const userId = 'user-id';
      const missionType = 'UNKNOWN_TYPE' as any;
      const progress = 1;
      const mockMission = {
        id: 'mission-1',
        type: missionType,
        targetValue: 5,
        completedBy: [],
      };
      getActiveMissionsSpy.mockResolvedValue([mockMission]);

      await expect(service.updateMissionProgress(userId, missionType, progress)).rejects.toThrow(BadRequestException);
      expect(getActiveMissionsSpy).toHaveBeenCalledWith(userId);
      expect(missionRepository.save).not.toHaveBeenCalled();
      expect(awardMissionRewardsSpy).not.toHaveBeenCalled();
    });
  });

  describe('awardMissionRewards', () => {
    it('should award points and badge to the user', async () => {
      const userId = 'user-id';
      const mockMission = {
        id: 'mission-1',
        title: 'Test Mission',
        rewardPoints: 100,
        rewardBadge: { id: 'badge-1', name: 'Test Badge', icon: '✨' },
      };
      const mockGamification = {
        userId: userId,
        points: 50,
        badges: [],
        recentActivities: [],
      };
      jest.spyOn(gamificationRepository, 'findOne').mockResolvedValue(mockGamification as any);
      jest.spyOn(gamificationRepository, 'save').mockResolvedValue(mockGamification as any);

      await (service as any).awardMissionRewards(userId, mockMission);

      expect(gamificationRepository.findOne).toHaveBeenCalledWith({ where: { userId } });
      expect(mockGamification.points).toBe(150); // 50 + 100
      expect(mockGamification.badges.length).toBe(1);
      expect(mockGamification.badges[0].id).toBe('badge-1');
      expect(mockGamification.recentActivities.length).toBe(1);
      expect(mockGamification.recentActivities[0].type).toBe('mission_completed');
      expect(mockGamification.recentActivities[0].pointsEarned).toBe(100);
      expect(gamificationRepository.save).toHaveBeenCalledWith(mockGamification);
    });

    it('should award only points if no badge is defined', async () => {
      const userId = 'user-id';
      const mockMission = {
        id: 'mission-1',
        title: 'Test Mission',
        rewardPoints: 100,
        rewardBadge: undefined,
      };
      const mockGamification = {
        userId: userId,
        points: 50,
        badges: [],
        recentActivities: [],
      };
      jest.spyOn(gamificationRepository, 'findOne').mockResolvedValue(mockGamification as any);
      jest.spyOn(gamificationRepository, 'save').mockResolvedValue(mockGamification as any);

      await (service as any).awardMissionRewards(userId, mockMission);

      expect(gamificationRepository.findOne).toHaveBeenCalledWith({ where: { userId } });
      expect(mockGamification.points).toBe(150); // 50 + 100
      expect(mockGamification.badges.length).toBe(0);
      expect(mockGamification.recentActivities.length).toBe(1);
      expect(mockGamification.recentActivities[0].type).toBe('mission_completed');
      expect(mockGamification.recentActivities[0].pointsEarned).toBe(100);
      expect(gamificationRepository.save).toHaveBeenCalledWith(mockGamification);
    });

    it('should throw NotFoundException if gamification profile is not found', async () => {
      const userId = 'user-id';
      const mockMission = {
        id: 'mission-1',
        title: 'Test Mission',
        rewardPoints: 100,
        rewardBadge: undefined,
      };
      jest.spyOn(gamificationRepository, 'findOne').mockResolvedValue(undefined);

      await expect((service as any).awardMissionRewards(userId, mockMission)).rejects.toThrow(NotFoundException);
      expect(gamificationRepository.findOne).toHaveBeenCalledWith({ where: { userId } });
      expect(gamificationRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('generateDailyMissions', () => {
    it('should generate and create daily missions', async () => {
      jest.spyOn(service, 'createMission').mockResolvedValue({} as any);

      const result = await service.generateDailyMissions();

      expect(service.createMission).toHaveBeenCalledTimes(4); // Expect 4 daily missions
      expect(service.createMission).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Aprende algo nuevo',
        type: MissionType.COMPLETE_LESSONS,
        frequency: 'diaria',
        rewardPoints: 120, // 60 * 2
      }));
      expect(service.createMission).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Domina la práctica',
        type: MissionType.PRACTICE_EXERCISES,
        frequency: 'diaria',
        rewardPoints: 160, // 80 * 2
      }));
      expect(service.createMission).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Descubre tu cultura',
        type: MissionType.CULTURAL_CONTENT,
        frequency: 'diaria',
        rewardPoints: 100, // 50 * 2
      }));
      expect(service.createMission).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Desafío de vocabulario',
        type: MissionType.VOCABULARY,
        frequency: 'diaria',
        rewardPoints: 140, // 70 * 2
      }));
      expect(result.length).toBe(4);
    });
  });

  describe('generateWeeklyMissions', () => {
    it('should generate and create weekly missions', async () => {
      jest.spyOn(service, 'createMission').mockResolvedValue({} as any);

      const result = await service.generateWeeklyMissions();

      expect(service.createMission).toHaveBeenCalledTimes(3); // Expect 3 weekly missions
      expect(service.createMission).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Campeón del aprendizaje',
        type: MissionType.COMPLETE_LESSONS,
        frequency: 'semanal',
        rewardBadge: { id: 'weekly-champion', name: 'Campeón Semanal', icon: '🏆' },
      }));
      expect(service.createMission).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Embajador cultural',
        type: MissionType.CULTURAL_CONTENT,
        frequency: 'semanal',
      }));
      expect(service.createMission).toHaveBeenCalledWith(expect.objectContaining({
        title: 'Desafío de racha semanal',
        type: MissionType.MAINTAIN_STREAK,
        frequency: 'semanal',
      }));
      expect(result.length).toBe(3);
    });
  });

  describe('update', () => {
    it('should update an existing mission', async () => {
      const missionId = 'test-mission-id';
      const updateMissionDto = { description: 'Updated description' };
      const existingMission = { id: missionId, name: 'Test Mission', description: 'Original description' };
      const updatedMission = { ...existingMission, ...updateMissionDto };

      jest.spyOn(missionRepository, 'findOne').mockResolvedValue(existingMission as any);
      jest.spyOn(missionRepository, 'save').mockResolvedValue(updatedMission as any);

      const result = await service.update(missionId, updateMissionDto as any);

      expect(missionRepository.findOne).toHaveBeenCalledWith({ where: { id: missionId } });
      expect(missionRepository.save).toHaveBeenCalledWith(expect.objectContaining(updateMissionDto));
      expect(result).toEqual(updatedMission);
    });

    it('should throw NotFoundException if mission to update is not found', async () => {
      const missionId = 'non-existent-id';
      const updateMissionDto = { description: 'Updated description' };

      jest.spyOn(missionRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.update(missionId, updateMissionDto as any)).rejects.toThrow(NotFoundException);
      expect(missionRepository.findOne).toHaveBeenCalledWith({ where: { id: missionId } });
      expect(missionRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove an existing mission', async () => {
      const missionId = 'test-mission-id';
      const existingMission = { id: missionId, name: 'Test Mission' };

      jest.spyOn(missionRepository, 'findOne').mockResolvedValue(existingMission as any);
      jest.spyOn(missionRepository, 'remove').mockResolvedValue(undefined);

      await service.remove(missionId);

      expect(missionRepository.findOne).toHaveBeenCalledWith({ where: { id: missionId } });
      expect(missionRepository.remove).toHaveBeenCalledWith(existingMission);
    });

    it('should throw NotFoundException if mission to remove is not found', async () => {
      const missionId = 'non-existent-id';

      jest.spyOn(missionRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.remove(missionId)).rejects.toThrow(NotFoundException);
      expect(missionRepository.findOne).toHaveBeenCalledWith({ where: { id: missionId } });
      expect(missionRepository.remove).not.toHaveBeenCalled();
    });
  });
});
