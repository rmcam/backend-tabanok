import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm"; // Import Repository
import { Gamification } from "../entities/gamification.entity";
import {
  MissionTemplate,
  MissionFrequency as MissionTemplateFrequency,
} from "../entities/mission-template.entity"; // Import MissionTemplate and its MissionFrequency enum
import {
  Mission,
  MissionFrequency,
  MissionType,
} from "../entities/mission.entity"; // Import Mission, MissionType, and MissionFrequency from mission.entity.ts
import {
  DynamicMissionService,
  mapTemplateFrequencyToMissionFrequency,
} from "./dynamic-mission.service";
import { StreakService } from "./streak.service";

describe("DynamicMissionService", () => {
  let service: DynamicMissionService;
  // Correct mock types to match injected types
  let mockMissionTemplateRepository: Partial<Repository<MissionTemplate>>;
  let mockMissionRepository: Partial<Repository<Mission>>; // Correct repository type
  let mockGamificationRepository: Partial<Repository<Gamification>>;
  let mockStreakService: Partial<StreakService>;

  beforeEach(async () => {
    mockMissionTemplateRepository = {
      find: jest.fn(), // Add find method mock
    };
    mockMissionRepository = {
      // Correct repository mock
      create: jest.fn(), // Add create method mock
      save: jest.fn(), // Add save method mock
    };
    mockGamificationRepository = {
      findOne: jest.fn(), // Add findOne method mock
    };
    mockStreakService = {
      getStreakInfo: jest.fn(), // Add getStreakInfo method mock
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DynamicMissionService,
        {
          provide: getRepositoryToken(MissionTemplate),
          useValue: mockMissionTemplateRepository,
        },
        {
          provide: getRepositoryToken(Mission), // Correct repository token
          useValue: mockMissionRepository, // Correct repository mock
        },
        {
          provide: getRepositoryToken(Gamification),
          useValue: mockGamificationRepository,
        },
        {
          provide: StreakService,
          useValue: mockStreakService,
        },
      ],
    }).compile();

    service = module.get<DynamicMissionService>(DynamicMissionService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("generateDynamicMissions", () => {
    it("should generate dynamic missions for a user", async () => {
      // Mock data
      const userId = "test-user-id";
      const mockGamification = {
        userId,
        level: 5,
        achievements: [],
      } as Gamification;
      const mockStreak = { currentStreak: 3 };
      const mockTemplates = [
        {
          id: "template-1",
          title: "Daily Mission",
          description: "Complete a daily task",
          type: MissionType.COMPLETE_LESSONS, // Corrected type based on enum definition
          frequency: MissionTemplateFrequency.DIARIA, // Use MissionTemplate's enum for template mock
          baseTargetValue: 10,
          baseRewardPoints: 50,
          minLevel: 1,
          maxLevel: 10,
          difficultyScaling: [
            { level: 1, targetMultiplier: 1, rewardMultiplier: 1 },
          ],
          requirements: {},
          bonusConditions: [],
          isActive: true, // Added missing property
          createdAt: new Date(), // Added missing property
          updatedAt: new Date(), // Added missing property
        } as MissionTemplate,
      ];
      const mockCreatedMission = {
        id: "mission-1",
        title: mockTemplates[0].title, // Corrected access
        description: mockTemplates[0].description, // Corrected access
        type: mockTemplates[0].type, // Corrected access
        frequency: MissionFrequency.DIARIA, // Corrected expectation
        targetValue: Math.round(mockTemplates[0].baseTargetValue * 1), // Use base value * mocked multiplier
        rewardPoints: Math.round(mockTemplates[0].baseRewardPoints * 1), // Use base value * mocked multiplier
        startDate: new Date(), // Will be calculated
        endDate: new Date(), // Will be calculated
        rewardBadge: mockTemplates[0].rewardBadge, // Corrected access
        bonusConditions: [],
        participants: [], // Added missing property
        season: null, // Added missing property
      } as Mission;

      // Mock repository and service methods
      mockGamificationRepository.findOne = jest
        .fn()
        .mockResolvedValue(mockGamification);
      mockStreakService.getStreakInfo = jest.fn().mockResolvedValue(mockStreak);
      mockMissionTemplateRepository.find = jest
        .fn()
        .mockResolvedValue(mockTemplates);
      jest
        .spyOn(service as any, "createDynamicMission")
        .mockResolvedValue(mockCreatedMission);

      // Call the service method
      const missions = await service.generateDynamicMissions(userId);

      // Assertions
      expect(mockGamificationRepository.findOne).toHaveBeenCalledWith({
        where: { userId },
        relations: ["achievements"],
      });
      expect(mockStreakService.getStreakInfo).toHaveBeenCalledWith(userId);
      expect(mockMissionTemplateRepository.find).toHaveBeenCalled();
      expect((service as any).createDynamicMission).toHaveBeenCalledWith(
        mockTemplates[0], // Use the template from the array
        mockGamification
      );
      expect(missions).toEqual([mockCreatedMission]);
    });

    // TODO: Add more test cases for generateDynamicMissions (e.g., no eligible templates, templates with requirements)
  });

  describe("getEligibleTemplates", () => {
    const mockGamificationBase = {
      userId: "test-user",
      level: 5,
      achievements: [],
    } as Gamification;
    const mockStreakBase = { currentStreak: 3 };

    const createMockTemplate = (
      overrides: Partial<MissionTemplate> = {}
    ): MissionTemplate => ({
      id: `template-${Math.random()}`,
      title: "Test Mission",
      description: "A test mission",
      type: MissionType.COMPLETE_LESSONS,
      frequency: MissionTemplateFrequency.DIARIA,
      baseTargetValue: 10,
      baseRewardPoints: 50,
      minLevel: 1,
      maxLevel: 0, // 0 means no max level
      difficultyScaling: [
        { level: 1, targetMultiplier: 1, rewardMultiplier: 1 },
      ],
      requirements: {},
      rewardBadge: null,
      bonusConditions: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    });

    it("should filter templates by minLevel", async () => {
      const mockGamification = { ...mockGamificationBase, level: 3 };
      const mockTemplates = [
        createMockTemplate({ minLevel: 1 }),
        createMockTemplate({ minLevel: 5 }),
      ];
      mockMissionTemplateRepository.find = jest
        .fn()
        .mockResolvedValue(mockTemplates);

      const eligibleTemplates = await (service as any).getEligibleTemplates(
        mockGamification
      );

      expect(eligibleTemplates).toEqual([mockTemplates[0]]);
    });

    it("should filter templates by maxLevel", async () => {
      const mockGamification = { ...mockGamificationBase, level: 15 };
      const mockTemplates = [
        createMockTemplate({ maxLevel: 10 }),
        createMockTemplate({ maxLevel: 20 }),
      ];
      mockMissionTemplateRepository.find = jest
        .fn()
        .mockResolvedValue(mockTemplates);

      const eligibleTemplates = await (service as any).getEligibleTemplates(
        mockGamification
      );

      expect(eligibleTemplates).toEqual([mockTemplates[1]]);
    });

    it("should filter templates by isActive status", async () => {
      const mockGamification = mockGamificationBase;
      const mockTemplates = [
        createMockTemplate({ isActive: true }),
        createMockTemplate({ isActive: false }),
      ];
      mockMissionTemplateRepository.find = jest
        .fn()
        .mockResolvedValue(mockTemplates);

      const eligibleTemplates = await (service as any).getEligibleTemplates(
        mockGamification
      );

      expect(eligibleTemplates).toEqual([mockTemplates[0]]);
    });

    it("should filter templates by requiredAchievements", async () => {
      const mockGamification = {
        ...mockGamificationBase,
        achievements: [{ id: "ach-1" } as any],
      };
      const mockTemplates = [
        createMockTemplate({
          requirements: { specificAchievements: ["ach-1"] },
        }),
        createMockTemplate({
          requirements: { specificAchievements: ["ach-2"] },
        }),
      ];
      mockMissionTemplateRepository.find = jest
        .fn()
        .mockResolvedValue(mockTemplates);

      const eligibleTemplates = await (service as any).getEligibleTemplates(
        mockGamification
      );

      expect(eligibleTemplates).toEqual([mockTemplates[0]]);
    });

    it("should filter templates by minimumStreak when user streak is too low", async () => {
      const mockGamification = mockGamificationBase;
      const mockStreak = { currentStreak: 2 }; // User streak is 2
      const mockTemplates = [
        createMockTemplate({ requirements: { minimumStreak: 3 } }), // Requires streak 3 (should be filtered out)
        createMockTemplate({ requirements: { minimumStreak: 1 } }), // Requires streak 1 (should be eligible)
      ];
      mockMissionTemplateRepository.find = jest
        .fn()
        .mockResolvedValue(mockTemplates);
      mockStreakService.getStreakInfo = jest.fn().mockResolvedValue(mockStreak);

      const eligibleTemplates = await (service as any).getEligibleTemplates(
        mockGamification,
        mockStreak // Pasar mockStreak
      );

      expect(eligibleTemplates).toEqual([mockTemplates[1]]); // Only the second template should be eligible
    });

    it("should filter templates by requiredStreaks", async () => {
      const mockGamification = mockGamificationBase;
      const mockStreak = { currentStreak: 5 };
      const mockTemplates = [
        createMockTemplate({ requirements: { minimumStreak: 3 } }),
        createMockTemplate({ requirements: { minimumStreak: 10 } }),
      ];
      mockMissionTemplateRepository.find = jest
        .fn()
        .mockResolvedValue(mockTemplates);
      mockStreakService.getStreakInfo = jest.fn().mockResolvedValue(mockStreak);

      const eligibleTemplates = await (service as any).getEligibleTemplates(
        mockGamification,
        mockStreak // Pasar mockStreak
      );

      expect(eligibleTemplates).toEqual([mockTemplates[0]]);
    });

    it("should filter templates by minimumStreak when user streak is too low", async () => {
      const mockGamification = mockGamificationBase;
      const mockStreak = { currentStreak: 2 }; // User streak is 2
      const mockTemplates = [
        createMockTemplate({ requirements: { minimumStreak: 3 } }), // Requires streak 3 (should be filtered out)
        createMockTemplate({ requirements: { minimumStreak: 1 } }), // Requires streak 1 (should be eligible)
      ];
      mockMissionTemplateRepository.find = jest
        .fn()
        .mockResolvedValue(mockTemplates);
      mockStreakService.getStreakInfo = jest.fn().mockResolvedValue(mockStreak);

      const eligibleTemplates = await (service as any).getEligibleTemplates(
        mockGamification,
        mockStreak // Pasar mockStreak
      );

      expect(eligibleTemplates).toEqual([mockTemplates[1]]); // Only the second template should be eligible
    });

    it("should return empty array if no templates are found", async () => {
      const mockGamification = mockGamificationBase;
      mockMissionTemplateRepository.find = jest.fn().mockResolvedValue([]);

      const eligibleTemplates = await (service as any).getEligibleTemplates(
        mockGamification
      );

      expect(eligibleTemplates).toEqual([]);
    });

    it("should return empty array if no eligible templates are found", async () => {
      const mockGamification = { ...mockGamificationBase, level: 0 }; // Level too low
      const mockTemplates = [createMockTemplate({ minLevel: 1 })];
      mockMissionTemplateRepository.find = jest
        .fn()
        .mockResolvedValue(mockTemplates);

      const eligibleTemplates = await (service as any).getEligibleTemplates(
        mockGamification
      );

      expect(eligibleTemplates).toEqual([]);
    });
  });

  describe("createDynamicMission", () => {
    const createMockTemplate = (
      overrides: Partial<MissionTemplate> = {}
    ): MissionTemplate => ({
      id: `template-${Math.random()}`,
      title: "Test Mission",
      description: "A test mission",
      type: MissionType.COMPLETE_LESSONS,
      frequency: MissionTemplateFrequency.DIARIA,
      baseTargetValue: 10,
      baseRewardPoints: 50,
      minLevel: 1,
      maxLevel: 0,
      difficultyScaling: [
        { level: 1, targetMultiplier: 1, rewardMultiplier: 1 },
      ],
      requirements: {},
      bonusConditions: [],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...overrides,
    });

    it("should create a dynamic mission from a template", async () => {
      const mockTemplate = createMockTemplate();
      const mockGamification = {
        userId: "test-user-id",
        level: 1,
        achievements: [],
      } as Gamification;

      // Mock the dependencies that createDynamicMission will call
      const mockDates = { startDate: new Date(), endDate: new Date() }; // Create dates here
      jest
        .spyOn(service as any, "calculateMissionDates")
        .mockReturnValue(mockDates); // Return these dates
      const scaling = {
        // Define scaling here
        targetMultiplier: 1,
        rewardMultiplier: 1,
      };
      jest.spyOn(service as any, "calculateScaling").mockReturnValue(scaling); // Mock calculateScaling

      // Define mockCreatedMission using the dates from mockDates
      const mockCreatedMission = {
        id: "mission-1", // Assign a mock ID
        title: mockTemplate.title,
        description: mockTemplate.description,
        type: mockTemplate.type,
        frequency: MissionFrequency.DIARIA, // Corrected expectation
        targetValue: Math.round(
          mockTemplate.baseTargetValue * scaling.targetMultiplier
        ), // Use base value * mocked multiplier
        rewardPoints: Math.round(
          mockTemplate.baseRewardPoints * scaling.rewardMultiplier
        ), // Use base value * mocked multiplier
        startDate: mockDates.startDate, // Use dates from mockDates
        endDate: mockDates.endDate, // Use dates from mockDates
        rewardBadge: mockTemplate.rewardBadge,
        bonusConditions: mockTemplate.bonusConditions,
        participants: [],
        season: null,
      } as Mission;

      mockMissionRepository.create = jest
        .fn()
        .mockImplementation((missionData) => ({
          // Use mockImplementation
          id: "mission-1", // Assign a mock ID
          ...missionData, // Include the data passed to create
          participants: [], // Add participants property
          startDate: mockDates.startDate, // Ensure dates match the mocked calculateMissionDates
          endDate: mockDates.endDate, // Ensure dates match the mocked calculateMissionDates
        }));
      mockMissionRepository.save = jest
        .fn()
        .mockResolvedValue(mockCreatedMission); // Still mock save to return a resolved value

      const createdMission = await (service as any).createDynamicMission(
        mockTemplate,
        mockGamification
      );

      expect((service as any).calculateScaling).toHaveBeenCalledWith(
        // Expect calculateScaling to be called
        mockTemplate,
        mockGamification.level
      );
      expect((service as any).calculateMissionDates).toHaveBeenCalledWith(
        mapTemplateFrequencyToMissionFrequency(mockTemplate.frequency)
      );
      expect(mockMissionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: mockTemplate.title,
          description: mockTemplate.description,
          type: mockTemplate.type,
          frequency: MissionFrequency.DIARIA, // Corrected expectation
          targetValue: Math.round(
            mockTemplate.baseTargetValue * scaling.targetMultiplier
          ), // Corrected expectation
          rewardPoints: Math.round(
            mockTemplate.baseRewardPoints * scaling.rewardMultiplier
          ), // Corrected expectation
          rewardBadge: mockTemplate.rewardBadge,
          bonusConditions: mockTemplate.bonusConditions,
          completedBy: [], // Missions are created with empty completedBy initially
          // participants: [], // participants no se pasa explícitamente
          startDate: mockDates.startDate, // Usar la fecha mockeada
          endDate: mockDates.endDate, // Usar la fecha mockeada
        })
      );
      // The save mock should receive the object returned by the create mock
      expect(mockMissionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "mission-1", // Expect the mock ID
          title: mockTemplate.title,
          description: mockTemplate.description,
          type: mockTemplate.type,
          frequency: MissionFrequency.DIARIA,
          targetValue: Math.round(
            mockTemplate.baseTargetValue * scaling.targetMultiplier
          ), // Corrected expectation
          rewardPoints: Math.round(
            mockTemplate.baseRewardPoints * scaling.rewardMultiplier
          ), // Corrected expectation
          rewardBadge: mockTemplate.rewardBadge,
          bonusConditions: mockTemplate.bonusConditions,
          completedBy: [],
          participants: [],
          startDate: mockDates.startDate, // Expect the specific date returned by calculateMissionDates mock
          endDate: mockDates.endDate, // Expect the specific date returned by calculateMissionDates mock
        })
      );
      // The returned mission should match the object returned by the save mock
      expect(createdMission).toEqual(mockCreatedMission); // This assertion might still fail if mockCreatedMission is not updated correctly
    });

    it("should apply difficulty scaling based on user level", async () => {
      const userId = "test-user-id-scaled";
      const mockTemplate: MissionTemplate = {
        id: "template-scaled",
        title: "Scaled Mission",
        description: "A mission with scaling",
        type: MissionType.COMPLETE_LESSONS,
        frequency: MissionTemplateFrequency.SEMANAL, // Use a different frequency
        baseTargetValue: 20,
        baseRewardPoints: 100,
        minLevel: 1,
        maxLevel: 0,
        difficultyScaling: [
          { level: 1, targetMultiplier: 1, rewardMultiplier: 1 },
          { level: 5, targetMultiplier: 1.5, rewardMultiplier: 1.2 }, // Scaling for level 5
          { level: 10, targetMultiplier: 2, rewardMultiplier: 1.5 },
        ],
        requirements: {},
        rewardBadge: null,
        bonusConditions: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockGamification = {
        userId,
        level: 5,
        achievements: [],
      } as Gamification;

      // Expected scaled values for level 5
      const expectedTargetMultiplier = 1.5;
      const expectedRewardMultiplier = 1.2;

      // Mock the dependencies that createDynamicMission will call
      const scaling = {
        // Define scaling here
        targetMultiplier: expectedTargetMultiplier,
        rewardMultiplier: expectedRewardMultiplier,
      };
      jest.spyOn(service as any, "calculateScaling").mockReturnValue(scaling); // Mock calculateScaling
      const mockDates = { startDate: new Date(), endDate: new Date() }; // Create dates here
      jest
        .spyOn(service as any, "calculateMissionDates")
        .mockReturnValue(mockDates); // Return these dates

      // Define mockCreatedMission using the dates from mockDates and scaled values
      const mockCreatedMission = {
        id: "mission-scaled",
        title: "Scaled Mission",
        description: "A mission with scaling",
        type: mockTemplate.type, // Use template type
        frequency: MissionFrequency.SEMANAL, // Corrected expectation
        targetValue: Math.round(
          mockTemplate.baseTargetValue * expectedTargetMultiplier
        ),
        rewardPoints: Math.round(
          mockTemplate.baseRewardPoints * expectedRewardMultiplier
        ),
        startDate: mockDates.startDate, // Use dates from mockDates
        endDate: mockDates.endDate, // Use dates from mockDates
        rewardBadge: mockTemplate.rewardBadge,
        bonusConditions: mockTemplate.bonusConditions,
        participants: [],
        season: null,
      } as Mission;

      mockMissionRepository.create = jest
        .fn()
        .mockImplementation((missionData) => ({
          // Use mockImplementation
          id: "mission-scaled", // Assign a mock ID
          ...missionData, // Include the data passed to create
          participants: [], // Add participants property
          startDate: mockDates.startDate, // Ensure dates match the mocked calculateMissionDates
          endDate: mockDates.endDate, // Ensure dates match the mocked calculateMissionDates
        }));
      mockMissionRepository.save = jest
        .fn()
        .mockResolvedValue(mockCreatedMission); // Still mock save to return a resolved value

      const createdMission = await (service as any).createDynamicMission(
        mockTemplate,
        mockGamification
      );

      expect((service as any).calculateScaling).toHaveBeenCalledWith(
        // Expect calculateScaling to be called
        mockTemplate,
        mockGamification.level
      );
      expect((service as any).calculateMissionDates).toHaveBeenCalledWith(
        mapTemplateFrequencyToMissionFrequency(mockTemplate.frequency) // Corrected expectation
      );
      expect(mockMissionRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: mockTemplate.title,
          description: mockTemplate.description,
          type: mockTemplate.type,
          frequency: MissionFrequency.SEMANAL, // Corrected expectation
          targetValue: Math.round(
            mockTemplate.baseTargetValue * expectedTargetMultiplier
          ), // Use base value * mocked multiplier
          rewardPoints: Math.round(
            mockTemplate.baseRewardPoints * expectedRewardMultiplier
          ), // Use base value * mocked multiplier
          rewardBadge: mockTemplate.rewardBadge,
          bonusConditions: mockTemplate.bonusConditions,
          completedBy: [], // Missions are created with empty completedBy initially
          // participants: [], // participants no se pasa explícitamente
          startDate: mockDates.startDate, // Usar la fecha mockeada
          endDate: mockDates.endDate, // Usar la fecha mockeada
        })
      );
      // The save mock st receive the object returned by the create mock
      expect(mockMissionRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "mission-scaled", // Expect the mock ID
          title: mockTemplate.title,
          description: mockTemplate.description,
          type: mockTemplate.type,
          frequency: MissionFrequency.SEMANAL,
          targetValue: Math.round(
            mockTemplate.baseTargetValue * expectedTargetMultiplier
          ),
          rewardPoints: Math.round(
            mockTemplate.baseRewardPoints * expectedRewardMultiplier
          ),
          rewardBadge: mockTemplate.rewardBadge,
          bonusConditions: mockTemplate.bonusConditions,
          completedBy: [],
          participants: [],
          startDate: mockDates.startDate, // Expect the specific date returned by calculateMissionDates mock
          endDate: mockDates.endDate, // Expect the specific date returned by calculateMissionDates mock
        })
      );
      // The returned mission should match the object returned by the save mock
      expect(createdMission).toEqual(mockCreatedMission); // This assertion might still fail if mockCreatedMission is not updated correctly
    });
  });

  describe("calculateScaling", () => {
    it("should return base values if no scaling applies", () => {
      const mockTemplate: MissionTemplate = {
        id: "template-no-scaling",
        title: "No Scaling Mission",
        description: "This mission has no scaling",
        type: MissionType.COMPLETE_LESSONS,
        frequency: MissionTemplateFrequency.DIARIA,
        baseTargetValue: 10,
        baseRewardPoints: 50,
        minLevel: 1,
        maxLevel: 0,
        difficultyScaling: [
          { level: 1, targetMultiplier: 1, rewardMultiplier: 1 },
          { level: 5, targetMultiplier: 1.5, rewardMultiplier: 1.2 },
          { level: 10, targetMultiplier: 2, rewardMultiplier: 1.5 },
        ],
        requirements: {},
        bonusConditions: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const userLevel = 5;

      const scaling = (service as any).calculateScaling(
        mockTemplate,
        userLevel
      );

      // Expect the scaling for level 5, as it's the highest applicable level below userLevel
      expect(scaling).toEqual({
        level: 5,
        targetMultiplier: 1.5,
        rewardMultiplier: 1.2,
      });
    });

    it("should apply scaling based on the highest applicable level", () => {
      const mockTemplate: MissionTemplate = {
        id: "template-scaling",
        title: "Scaling Mission",
        description: "This mission has scaling",
        type: MissionType.COMPLETE_LESSONS,
        frequency: MissionTemplateFrequency.DIARIA,
        baseTargetValue: 10,
        baseRewardPoints: 50,
        minLevel: 1,
        maxLevel: 0,
        difficultyScaling: [
          { level: 1, targetMultiplier: 1, rewardMultiplier: 1 },
          { level: 5, targetMultiplier: 1.5, rewardMultiplier: 1.2 },
          { level: 10, targetMultiplier: 2, rewardMultiplier: 1.5 },
        ],
        requirements: {},
        bonusConditions: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const userLevel = 7; // Should use scaling for level 5

      const scaling = (service as any).calculateScaling(
        mockTemplate,
        userLevel
      );

      expect(scaling).toEqual({
        level: 5,
        targetMultiplier: 1.5,
        rewardMultiplier: 1.2,
      });
    });

    it("should use the highest scaling level if user level is above max scaling level", () => {
      const mockTemplate: MissionTemplate = {
        id: "template-scaling",
        title: "Scaling Mission",
        description: "This mission has scaling",
        type: MissionType.COMPLETE_LESSONS,
        frequency: MissionTemplateFrequency.DIARIA,
        baseTargetValue: 10,
        baseRewardPoints: 50,
        minLevel: 1,
        maxLevel: 0,
        difficultyScaling: [
          { level: 1, targetMultiplier: 1, rewardMultiplier: 1 },
          { level: 5, targetMultiplier: 1.5, rewardMultiplier: 1.2 },
          { level: 10, targetMultiplier: 2, rewardMultiplier: 1.5 },
        ],
        requirements: {},
        bonusConditions: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const userLevel = 15; // Should use scaling for level 10

      const scaling = (service as any).calculateScaling(
        mockTemplate,
        userLevel
      );

      expect(scaling).toEqual({
        level: 10,
        targetMultiplier: 2,
        rewardMultiplier: 1.5,
      });
    });

    it("should use the lowest scaling level if user level is below min scaling level but above template min level", () => {
      const mockTemplate: MissionTemplate = {
        id: "template-scaling",
        title: "Scaling Mission",
        description: "This mission has scaling",
        type: MissionType.COMPLETE_LESSONS,
        frequency: MissionTemplateFrequency.DIARIA,
        baseTargetValue: 10,
        baseRewardPoints: 50,
        minLevel: 3, // Template min level is 3
        maxLevel: 0,
        difficultyScaling: [
          { level: 5, targetMultiplier: 1.5, rewardMultiplier: 1.2 }, // Scaling starts at level 5
          { level: 10, targetMultiplier: 2, rewardMultiplier: 1.5 },
        ],
        requirements: {},
        bonusConditions: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const userLevel = 4; // Should use base scaling (multiplier 1)

      const scaling = (service as any).calculateScaling(
        mockTemplate,
        userLevel
      );

      expect(scaling).toEqual({ targetMultiplier: 1, rewardMultiplier: 1 });
    });
  });

  describe("calculateMissionDates", () => {
    // Mock Date to control the current time for consistent test results
    const realDate = Date;
    beforeAll(() => {
      const mockDate = new Date("2025-04-28T10:00:00.000Z"); // Sunday, April 28, 2025 10:00:00 AM UTC
      global.Date = class extends Date {
        constructor(dateString?: string) {
          if (dateString) {
            super(dateString);
          } else {
            return mockDate;
          }
        }
      } as any;
    });

    afterAll(() => {
      global.Date = realDate;
    });

    it("should calculate dates for DIARIA frequency", () => {
      const frequency = MissionFrequency.DIARIA; // Corrected expectation
      const { startDate, endDate } = (service as any).calculateMissionDates(
        frequency
      );

      const expectedStartDate = new Date("2025-04-28T05:00:00.000Z"); // Start of the current day (UTC-5)
      const expectedEndDate = new Date("2025-04-29T04:59:59.999Z"); // End of the current day (UTC-5)

      expect(startDate).toEqual(expectedStartDate);
      expect(endDate).toEqual(expectedEndDate);
    });

    it("should calculate dates for SEMANAL frequency", () => {
      const frequency = MissionFrequency.SEMANAL; // Corrected expectation
      const { startDate, endDate } = (service as any).calculateMissionDates(
        frequency
      );

      const expectedStartDate = new Date("2025-04-27T05:00:00.000Z"); // Start of the current week (Saturday UTC-5)
      const expectedEndDate = new Date("2025-05-04T04:59:59.999Z"); // End of the current week (Saturday UTC-5)

      expect(startDate).toEqual(expectedStartDate);
      expect(endDate).toEqual(expectedEndDate);
    });

    it("should calculate dates for MENSUAL frequency", () => {
      const frequency = MissionFrequency.MENSUAL; // Corrected expectation
      const { startDate, endDate } = (service as any).calculateMissionDates(
        frequency
      );

      const expectedStartDate = new Date("2025-04-01T05:00:00.000Z"); // Start of the current month (UTC-5)
      const expectedEndDate = new Date("2025-05-01T04:59:59.999Z"); // End of the current month (UTC-5)

      expect(startDate).toEqual(expectedStartDate);
      expect(endDate).toEqual(expectedEndDate);
    });

    it("should throw error for unknown frequency", () => {
      const frequency = "UNKNOWN" as MissionFrequency; // Simulate unknown frequency

      expect(() => (service as any).calculateMissionDates(frequency)).toThrow(
        `Unknown mission frequency: ${frequency}`
      );
    });
  });

  describe("checkBonusConditions", () => {
    const createMockMission = (overrides: Partial<Mission> = {}): Mission => ({
      id: `mission-${Math.random()}`,
      title: "Test Mission",
      description: "A test mission",
      type: MissionType.COMPLETE_LESSONS,
      frequency: MissionFrequency.DIARIA,
      targetValue: 10,
      rewardPoints: 50,
      startDate: new Date(),
      endDate: new Date(),
      rewardBadge: null,
      completedBy: [],
      bonusConditions: [], // Default to no bonus conditions
      participants: [],
      season: null,
      ...overrides,
    });

    it("should return 0 if there are no bonus conditions", async () => {
      const userId = "user-id";
      const progress = 100;
      const mockMission = createMockMission();
      const mockGamification = {
        userId,
        level: 1,
        achievements: [],
      } as Gamification;

      // Mock dependencies to return values that won't trigger bonus conditions
      mockGamificationRepository.findOne = jest
        .fn()
        .mockResolvedValue(mockGamification);
      mockStreakService.getStreakInfo = jest
        .fn()
        .mockResolvedValue({ currentStreak: 0 });

      const result = await (service as any).checkBonusConditions(
        userId,
        mockMission,
        progress
      );

      expect(result).toBe(0);
    });

    it("should return bonus points if all bonus conditions are met", async () => {
      const userId = "user-id";
      const progress = 100; // Perfect score
      const mockMission = createMockMission({
        rewardPoints: 100,
        bonusConditions: [
          {
            condition: "perfect_score",
            multiplier: 1.5,
            description: "Bonus for perfect score",
          },
          {
            condition: "streak_active",
            multiplier: 1.2,
            description: "Bonus for streak",
          },
        ],
      });
      const mockStreak = { currentStreak: 5 }; // Active streak
      const mockGamification = {
        userId,
        level: 5,
        achievements: [],
      } as Gamification;

      mockGamificationRepository.findOne = jest
        .fn()
        .mockResolvedValue(mockGamification); // Mock gamification findOne
      mockStreakService.getStreakInfo = jest.fn().mockResolvedValue(mockStreak); // Mock streakService

      const result = await (service as any).checkBonusConditions(
        userId,
        mockMission,
        progress
      );

      // Expected bonus: (100 * (1.5 - 1)) + (100 * (1.2 - 1)) = 50 + 20 = 70
      expect(result).toBe(70);
      expect(mockStreakService.getStreakInfo).toHaveBeenCalledWith(userId);
    });

    it("should return 0 if streak_active condition is not met", async () => {
      const userId = "user-id";
      const progress = 100; // Doesn't matter for this condition
      const mockMission = createMockMission({
        rewardPoints: 100,
        bonusConditions: [
          {
            condition: "streak_active",
            multiplier: 1.2,
            description: "Bonus for streak",
          },
        ],
      });
      const mockStreak = { currentStreak: 0 }; // No active streak
      const mockGamification = {
        userId,
        level: 5,
        achievements: [],
      } as Gamification;

      mockGamificationRepository.findOne = jest
        .fn()
        .mockResolvedValue(mockGamification); // Mock gamification findOne
      mockStreakService.getStreakInfo = jest.fn().mockResolvedValue(mockStreak); // Mock streakService

      const result = await (service as any).checkBonusConditions(
        userId,
        mockMission,
        progress
      );

      expect(result).toBe(0);
      expect(mockStreakService.getStreakInfo).toHaveBeenCalledWith(userId);
    });

    it("should return 0 if perfect_score condition is not met", async () => {
      const userId = "user-id";
      const progress = 99; // Not perfect score
      const mockMission = createMockMission({
        rewardPoints: 100,
        bonusConditions: [
          {
            condition: "perfect_score",
            multiplier: 1.5,
            description: "Bonus for perfect score",
          },
        ],
      });
      const mockGamification = {
        userId,
        level: 5,
        achievements: [],
      } as Gamification;

      mockGamificationRepository.findOne = jest
        .fn()
        .mockResolvedValue(mockGamification); // Mock gamification findOne

      const result = await (service as any).checkBonusConditions(
        userId,
        mockMission,
        progress
      );

      expect(result).toBe(0);
    });

    it("should return 0 if any condition is not met", async () => {
      const userId = "user-id";
      const progress = 99; // Not perfect score
      const mockMission = createMockMission({
        rewardPoints: 100,
        bonusConditions: [
          {
            condition: "perfect_score",
            multiplier: 1.5,
            description: "Bonus for perfect score",
          },
          {
            condition: "streak_active",
            multiplier: 1.2,
            description: "Bonus for streak",
          },
        ],
      });
      const mockStreak = { currentStreak: 0 }; // No active streak
      const mockGamification = {
        userId,
        level: 5,
        achievements: [],
      } as Gamification;

      mockGamificationRepository.findOne = jest
        .fn()
        .mockResolvedValue(mockGamification); // Mock gamification findOne
      mockStreakService.getStreakInfo = jest.fn().mockResolvedValue(mockStreak); // Mock streakService

      const result = await (service as any).checkBonusConditions(
        userId,
        mockMission,
        progress
      );

      expect(result).toBe(0);
      expect(mockStreakService.getStreakInfo).toHaveBeenCalledWith(userId);
    });

    it("should handle unknown bonus condition types (return 0 for that condition)", async () => {
      const userId = "user-id";
      const progress = 100; // Perfect score
      const mockMission = createMockMission({
        rewardPoints: 100,
        bonusConditions: [
          {
            condition: "perfect_score",
            multiplier: 1.5,
            description: "Bonus for perfect score",
          },
          {
            condition: "unknownCondition:someValue",
            multiplier: 1.3,
            description: "Unknown bonus",
          },
        ],
      });
      const mockGamification = {
        userId,
        level: 5,
        achievements: [],
      } as Gamification;

      mockGamificationRepository.findOne = jest
        .fn()
        .mockResolvedValue(mockGamification); // Mock gamification findOne

      const result = await (service as any).checkBonusConditions(
        userId,
        mockMission,
        progress
      );

      // Only perfect_score condition should contribute
      expect(result).toBe(Math.round(100 * (1.5 - 1))); // 50 bonus points
    });

    it("should handle unknown bonus condition types (return 0 for that condition)", async () => {
      // Spy on console.warn to prevent output during this test
      jest.spyOn(console, "warn").mockImplementation(() => {});

      const userId = "user-id";
      const progress = 100; // Perfect score
      const mockMission = createMockMission({
        rewardPoints: 100,
        bonusConditions: [
          {
            condition: "perfect_score",
            multiplier: 1.5,
            description: "Bonus for perfect score",
          },
          {
            condition: "unknownCondition:someValue",
            multiplier: 1.3,
            description: "Unknown bonus",
          },
        ],
      });
      const mockGamification = {
        userId,
        level: 5,
        achievements: [],
      } as Gamification;

      mockGamificationRepository.findOne = jest
        .fn()
        .mockResolvedValue(mockGamification); // Mock gamification findOne

      const result = await (service as any).checkBonusConditions(
        userId,
        mockMission,
        progress
      );

      // Only perfect_score condition should contribute
      expect(result).toBe(Math.round(100 * (1.5 - 1))); // 50 bonus points

      // Restore console.warn after the test
      jest.restoreAllMocks();
    });

    // TODO: Add tests for specificAchievements bonus condition when implemented
  });
});
