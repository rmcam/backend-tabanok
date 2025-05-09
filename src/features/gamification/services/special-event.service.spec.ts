import { LessThanOrEqual, MoreThanOrEqual, Repository, DataSource } from "typeorm";
import { Achievement } from "../entities/achievement.entity";
import { Season } from "../entities/season.entity";
import { SpecialEvent } from "../entities/special-event.entity";
import { UserAchievement } from "../entities/user-achievement.entity";
import { GamificationService } from "./gamification.service";
import { SpecialEventService } from "./special-event.service";
import { UserAchievementRepository } from "../repositories/user-achievement.repository"; // Importar UserAchievementRepository

// Mock de los repositorios y servicios
const mockSpecialEventRepository: Partial<Repository<SpecialEvent>> = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
};

const mockSeasonRepository: Partial<Repository<Season>> = {
  findOne: jest.fn(),
};

const mockGamificationService: Partial<GamificationService> = {
  findByUserId: jest.fn(),
  awardPoints: jest.fn(),
  grantAchievement: jest.fn(),
  // Añadir otros métodos de GamificationService que se utilicen
};

const mockAchievementRepository: Partial<Repository<Achievement>> = {
  findOne: jest.fn(),
};

// Mock explícito para UserAchievementRepository
const mockUserAchievementRepository = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn().mockResolvedValue([]), // Añadir el método find y mockear para devolver un array vacío por defecto
  // Mock de la propiedad dataSource
  dataSource: {
    createEntityManager: jest.fn(),
    // Añadir otros métodos de DataSource si se utilizan
  },
  // Añadir otros métodos de UserAchievementRepository si se utilizan en SpecialEventService
} as any; // Usar 'as any' para evitar errores de tipo si no mockeamos todos los métodos de Repository


describe("SpecialEventService", () => {
  let service: SpecialEventService;
  let specialEventRepository: Partial<Repository<SpecialEvent>>;
  let seasonRepository: Partial<Repository<Season>>;
  let gamificationService: Partial<GamificationService>;
  let achievementRepository: Partial<Repository<Achievement>>;
  let userAchievementRepository: any; // Usar 'any' o el tipo mockeado explícito
  let gamificationServiceSpy: jest.SpyInstance;


  beforeEach(async () => {
    // Asignar los mocks a las variables locales
    specialEventRepository = mockSpecialEventRepository;
    seasonRepository = mockSeasonRepository;
    gamificationService = mockGamificationService;
    achievementRepository = mockAchievementRepository;
    userAchievementRepository = mockUserAchievementRepository;


    // Crear una instancia del servicio pasando los mocks en el constructor
    service = new SpecialEventService(
      specialEventRepository as Repository<SpecialEvent>, // Castear a tipo completo si es necesario para el constructor
      seasonRepository as Repository<Season>,
      gamificationService as GamificationService,
      achievementRepository as Repository<Achievement>,
      userAchievementRepository as UserAchievementRepository // Castear al tipo esperado
    );

    // Espiar el método awardPoints de GamificationService
    gamificationServiceSpy = jest.spyOn(gamificationService, 'awardPoints');
  });

  afterEach(() => {
    // Limpiar los mocks después de cada test
    jest.clearAllMocks();
    // Restaurar la espía de GamificationService después de cada test
    if (gamificationServiceSpy) {
      gamificationServiceSpy.mockRestore();
    }
  });


  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("getActiveEvents", () => {
    it("should return active events within the date range", async () => {
      const now = new Date();
      const activeEvent1 = {
        id: "event-1",
        name: "Active Event 1",
        startDate: new Date(now.getTime() - 10000), // Started 10 seconds ago
        endDate: new Date(now.getTime() + 10000), // Ends in 10 seconds
        isActive: true,
        season: {
          id: "season-1",
          type: "BETSCNATE" as any,
          startDate: new Date(),
          endDate: new Date(),
        },
        rewards: {},
        requirements: {},
        culturalElements: { traditions: [], vocabulary: [], activities: [] },
        participants: [],
      };
      const activeEvent2 = {
        id: "event-2",
        name: "Active Event 2",
        startDate: new Date(now.getTime() - 20000), // Started 20 seconds ago
        endDate: new Date(now.getTime() + 20000), // Ends in 20 seconds
        isActive: true,
        season: {
          id: "season-2",
          type: "JAJAN" as any,
          startDate: new Date(),
          endDate: new Date(),
        },
        rewards: {},
        requirements: {},
        culturalElements: { traditions: [], vocabulary: [], activities: [] },
        participants: [],
      };
      const inactiveEvent = {
        id: "event-3",
        name: "Inactive Event",
        startDate: new Date(now.getTime() - 10000),
        endDate: new Date(now.getTime() + 10000),
        isActive: false, // Inactive
        season: {
          id: "season-3",
          type: "BETSCNATE" as any,
          startDate: new Date(),
          endDate: new Date(),
        },
        rewards: {},
        requirements: {},
        culturalElements: { traditions: [], vocabulary: [], activities: [] },
        participants: [],
      };
      const futureEvent = {
        id: "event-4",
        name: "Future Event",
        startDate: new Date(now.getTime() + 10000), // Starts in the future
        endDate: new Date(now.getTime() + 20000),
        isActive: true,
        season: {
          id: "season-4",
          type: "JAJAN" as any,
          startDate: new Date(),
          endDate: new Date(),
        },
        rewards: {},
        requirements: {},
        culturalElements: { traditions: [], vocabulary: [], activities: [] },
        participants: [],
      };
      const pastEvent = {
        id: "event-5",
        name: "Past Event",
        startDate: new Date(now.getTime() - 20000),
        endDate: new Date(now.getTime() - 10000), // Ended in the past
        isActive: true,
        season: {
          id: "season-5",
          type: "BETSCNATE" as any,
          startDate: new Date(),
          endDate: new Date(),
        },
        rewards: {},
        requirements: {},
        culturalElements: { traditions: [], vocabulary: [], activities: [] },
        participants: [],
      };

      jest
        .spyOn(specialEventRepository, "find")
        .mockResolvedValue([activeEvent1, activeEvent2] as any); // Only return active ones

      const result = await service.getActiveEvents();

      expect(specialEventRepository.find).toHaveBeenCalledWith({
        where: {
          startDate: LessThanOrEqual(expect.any(Date)), // Use matcher
          endDate: MoreThanOrEqual(expect.any(Date)), // Use matcher
          isActive: true,
        },
        relations: ["season"],
      });
      expect(result).toEqual([activeEvent1, activeEvent2]);
    });

    it("should return an empty array if no active events are found", async () => {
      jest.spyOn(specialEventRepository, "find")
        .mockResolvedValue([]);

      const result = await service.getActiveEvents();

      expect(specialEventRepository.find).toHaveBeenCalled(); // Check if find was called
      expect(result).toEqual([]);
    });
  });

  describe("joinEvent", () => {
    it("should add a participant to the event", async () => {
      const eventId = "event-to-join";
      const userId = "user-joining";
      const mockEvent = {
        id: eventId,
        name: "Joinable Event",
        startDate: new Date(),
        endDate: new Date(new Date().getTime() + 10000),
        isActive: true,
        season: {
          id: "season-1",
          type: "BETSCNATE" as any,
          startDate: new Date(),
          endDate: new Date(),
        },
        rewards: {},
        requirements: { culturalAchievements: [] }, // No cultural achievement requirements
        culturalElements: { traditions: [], vocabulary: [], activities: [] },
        participants: [], // Initially empty
      };
      const mockGamification = { userId: Number(userId), userAchievements: [] };

      jest
        .spyOn(specialEventRepository, "findOne")
        .mockResolvedValue(mockEvent as any);
      jest
        .spyOn(gamificationService, "findByUserId")
        .mockResolvedValue(mockGamification as any);
      jest
        .spyOn(specialEventRepository, "save")
        .mockResolvedValue({
          ...mockEvent,
          participants: [{ userId, joinedAt: expect.any(Date), progress: 0 }],
        } as any);

      await service.joinEvent(eventId, userId);

      expect(specialEventRepository.findOne).toHaveBeenCalledWith({
        where: { id: eventId },
      });
      expect(gamificationService.findByUserId).toHaveBeenCalledWith(
        Number(userId)
      );
      expect(specialEventRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          participants: expect.arrayContaining([
            expect.objectContaining({
              userId,
              progress: 0,
            }),
          ]),
        })
      );
    });

    it("should throw NotFoundException if event is not found", async () => {
      const eventId = "non-existent-event";
      const userId = "user-joining";

      jest
        .spyOn(specialEventRepository, "findOne")
        .mockResolvedValue(undefined);

      await expect(service.joinEvent(eventId, userId)).rejects.toThrowError(
        `Evento con ID ${eventId} no encontrado`
      );
      expect(specialEventRepository.findOne).toHaveBeenCalledWith({
        where: { id: eventId },
      });
      expect(gamificationService.findByUserId).not.toHaveBeenCalled();
      expect(specialEventRepository.save).not.toHaveBeenCalled();
    });

    it("should throw an error if cultural achievement requirements are not met", async () => {
      const eventId = "event-with-requirements";
      const userId = "user-joining";
      const mockEvent = {
        id: eventId,
        name: "Event with Requirements",
        startDate: new Date(),
        endDate: new Date(new Date().getTime() + 10000),
        isActive: true,
        season: {
          id: "season-1",
          type: "BETSCNATTE" as any,
          startDate: new Date(),
          endDate: new Date(),
        },
        rewards: {},
        requirements: { culturalAchievements: ["required-achievement-id"] }, // Requires this achievement
        culturalElements: { traditions: [], vocabulary: [], activities: [] },
        participants: [],
      };
      const mockGamification = { userId: Number(userId), userAchievements: [] }; // User has no achievements

      jest
        .spyOn(specialEventRepository, "findOne")
        .mockResolvedValue(mockEvent as any);
      jest
        .spyOn(gamificationService, "findByUserId")
        .mockResolvedValue(mockGamification as any);
      // Mock userAchievementRepository.find to return an empty array
      mockUserAchievementRepository.find.mockResolvedValue([]);


      await expect(service.joinEvent(eventId, userId)).rejects.toThrowError(
        "No cumples con los logros culturales requeridos"
      );
      expect(specialEventRepository.findOne).toHaveBeenCalledWith({
        where: { id: eventId },
      });
      expect(gamificationService.findByUserId).toHaveBeenCalledWith(
        Number(userId)
      );
      expect(specialEventRepository.save).not.toHaveBeenCalled();
    });

    it("should add participant if cultural achievement requirements are met", async () => {
      const eventId = "event-with-requirements";
      const userId = "user-joining";
      const mockEvent = {
        id: eventId,
        name: "Event with Requirements",
        startDate: new Date(),
        endDate: new Date(new Date().getTime() + 10000),
        isActive: true,
        season: {
          id: "season-1",
          type: "BETSCNATTE" as any,
          startDate: new Date(),
          endDate: new Date(),
        },
        rewards: {},
        requirements: { culturalAchievements: ["required-achievement-id"] }, // Requires this achievement
        culturalElements: { traditions: [], vocabulary: [], activities: [] },
        participants: [],
      };
      const mockGamification = {
        userId: Number(userId),
        userAchievements: [{ achievementId: "required-achievement-id" }],
      }; // User has the required achievement

      jest
        .spyOn(specialEventRepository, "findOne")
        .mockResolvedValue(mockEvent as any);
      jest
        .spyOn(gamificationService, "findByUserId")
        .mockResolvedValue(mockGamification as any);
      jest
        .spyOn(specialEventRepository, "save")
        .mockResolvedValue({
          ...mockEvent,
          participants: [{ userId, joinedAt: expect.any(Date), progress: 0 }],
        } as any);
      // Mock userAchievementRepository.find to return the required achievement
      mockUserAchievementRepository.find.mockResolvedValue([
        { achievementId: "required-achievement-id" },
      ]);


      await service.joinEvent(eventId, userId);

      expect(specialEventRepository.findOne).toHaveBeenCalledWith({
        where: { id: eventId },
      });
      expect(gamificationService.findByUserId).toHaveBeenCalledWith(
        Number(userId)
      );
      expect(specialEventRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          participants: expect.arrayContaining([
            expect.objectContaining({
              userId,
              progress: 0,
            }),
          ]),
        })
      );
    });
  });

  describe("createSpecialEvent", () => {
    it("should create a special event successfully", async () => {
      const seasonId = "test-season-id";
      const eventData = {
        name: "Test Event",
        description: "A test event",
        type: "FESTIVAL" as any, // Use a valid EventType
        rewards: { points: 100, culturalValue: 50 },
        requirements: {},
        culturalElements: { traditions: [], vocabulary: [], activities: [] }, // Corregido
        startDate: new Date(),
        endDate: new Date(),
        isActive: true,
        participants: [],
      };
      const mockSeason = {
        id: seasonId,
        type: "BETSCNATE" as any,
        startDate: new Date(),
        endDate: new Date(),
      };
      const mockEvent = { ...eventData, season: mockSeason };

      jest
        .spyOn(seasonRepository, "findOne")
        .mockResolvedValue(mockSeason as any);
      jest
        .spyOn(specialEventRepository, "create")
        .mockReturnValue(mockEvent as any);
      jest
        .spyOn(specialEventRepository, "save")
        .mockResolvedValue(mockEvent as any);

      const result = await service.createSpecialEvent(seasonId, eventData);

      expect(seasonRepository.findOne).toHaveBeenCalledWith({
        where: { id: seasonId },
      });
      expect(specialEventRepository.create).toHaveBeenCalledWith({
        ...eventData,
        season: mockSeason,
      });
      expect(specialEventRepository.save).toHaveBeenCalledWith(mockEvent);
      expect(result).toEqual(mockEvent);
    });

    it("should throw NotFoundException if season is not found", async () => {
      const seasonId = "non-existent-season-id";
      const eventData = {
        name: "Test Event",
        description: "A test event",
        type: "FESTIVAL" as any,
        rewards: { points: 100, culturalValue: 50 },
        requirements: {},
        culturalElements: { traditions: [], vocabulary: [], activities: [] }, // Corregido
        startDate: new Date(),
        endDate: new Date(),
        isActive: true,
        participants: [],
      };

      jest.spyOn(seasonRepository, "findOne").mockResolvedValue(undefined);

      await expect(
        service.createSpecialEvent(seasonId, eventData)
      ).rejects.toThrowError(`Temporada con ID ${seasonId} no encontrada`);
      expect(seasonRepository.findOne).toHaveBeenCalledWith({
        where: { id: seasonId },
      });
      expect(specialEventRepository.create).not.toHaveBeenCalled();
      expect(specialEventRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("updateSpecialEvent", () => {
    it("should update a special event successfully", async () => {
      const eventId = "event-to-update";
      const updateData = {
        name: "Updated Event Name",
        description: "Updated description",
        isActive: false,
      };
      const mockEvent = {
        id: eventId,
        name: "Original Name",
        description: "Original description",
        isActive: true,
        season: {
          id: "season-1",
          type: "BETSCNATE" as any,
          startDate: new Date(),
          endDate: new Date(),
        },
        rewards: {},
        requirements: {},
        culturalElements: { traditions: [], vocabulary: [], activities: [] },
        participants: [],
      };
      const updatedEvent = { ...mockEvent, ...updateData };

      jest
        .spyOn(specialEventRepository, "findOne")
        .mockResolvedValue(mockEvent as any);
      jest
        .spyOn(specialEventRepository, "save")
        .mockResolvedValue(updatedEvent as any);

      const result = await service.updateSpecialEvent(eventId, updateData);

      expect(specialEventRepository.findOne).toHaveBeenCalledWith({
        where: { id: eventId },
      });
      expect(specialEventRepository.save).toHaveBeenCalledWith(updatedEvent);
      expect(result).toEqual(updatedEvent);
    });

    it("should throw NotFoundException if event is not found", async () => {
      const eventId = "non-existent-event";
      const updateData = { name: "Updated Name" };

      jest
        .spyOn(specialEventRepository, "findOne")
        .mockResolvedValue(undefined);

      await expect(
        service.updateSpecialEvent(eventId, updateData)
      ).rejects.toThrowError(`Evento con ID ${eventId} no encontrado`);
      expect(specialEventRepository.findOne).toHaveBeenCalledWith({
        where: { id: eventId },
      });
      expect(specialEventRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("deleteSpecialEvent", () => {
    it("should delete a special event successfully", async () => {
      const eventId = "event-to-delete";
      const mockEvent = {
        id: eventId,
        name: "Event to Delete",
        startDate: new Date(),
        endDate: new Date(),
        isActive: true,
        season: {
          id: "season-1",
          type: "BETSCNATE" as any,
          startDate: new Date(),
          endDate: new Date(),
        },
        rewards: {},
        requirements: {},
        culturalElements: { traditions: [], vocabulary: [], activities: [] },
        participants: [],
      };

      jest
        .spyOn(specialEventRepository, "findOne")
        .mockResolvedValue(mockEvent as any);
      jest
        .spyOn(specialEventRepository, "remove")
        .mockResolvedValue(mockEvent as any);

      await service.deleteSpecialEvent(eventId);

      expect(specialEventRepository.findOne).toHaveBeenCalledWith({
        where: { id: eventId },
      });
      expect(specialEventRepository.remove).toHaveBeenCalledWith(mockEvent);
    });

    it("should throw NotFoundException if event is not found", async () => {
      const eventId = "non-existent-event";

      jest
        .spyOn(specialEventRepository, "findOne")
        .mockResolvedValue(undefined);

      await expect(service.deleteSpecialEvent(eventId)).rejects.toThrowError(
        `Evento con ID ${eventId} no encontrado`
      );
      expect(specialEventRepository.findOne).toHaveBeenCalledWith({
        where: { id: eventId },
      });
      expect(specialEventRepository.remove).not.toHaveBeenCalled();
    });
  });

  describe("updateEventProgress", () => {
    let awardEventRewardsSpy: jest.SpyInstance;

    beforeEach(() => {
      // Spy on the private method before each test in this describe block
      awardEventRewardsSpy = jest
        .spyOn(service as any, "awardEventRewards")
        .mockResolvedValue(undefined);
    });

    afterEach(() => {
      // Restore the spy after each test
      awardEventRewardsSpy.mockRestore();
    });

    it("should update participant progress", async () => {
      const eventId = "event-to-update-progress";
      const userId = "user-updating-progress";
      const progress = 50;
      const mockEvent = {
        id: eventId,
        name: "Progress Event",
        startDate: new Date(),
        endDate: new Date(new Date().getTime() + 10000),
        isActive: true,
        season: {
          id: "season-1",
          type: "BETSCNATE" as any,
          startDate: new Date(),
          endDate: new Date(),
        },
        rewards: { points: 100 },
        requirements: {},
        culturalElements: { traditions: [], vocabulary: [], activities: [] },
        participants: [{ userId, joinedAt: new Date(), progress: 0 }],
      };
      const updatedEvent = {
        ...mockEvent,
        participants: [
          { userId, joinedAt: mockEvent.participants[0].joinedAt, progress },
        ],
      };

      jest
        .spyOn(specialEventRepository, "findOne")
        .mockResolvedValue(mockEvent as any);
      jest
        .spyOn(specialEventRepository, "save")
        .mockResolvedValue(updatedEvent as any);

      await service.updateEventProgress(eventId, userId, progress);

      expect(specialEventRepository.findOne).toHaveBeenCalledWith({
        where: { id: eventId },
      });
      expect(specialEventRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          participants: expect.arrayContaining([
            expect.objectContaining({
              userId,
              progress,
            }),
          ]),
        })
      );
      expect(awardEventRewardsSpy).not.toHaveBeenCalled(); // Not completed yet
    });

    it("should throw NotFoundException if event is not found", async () => {
      const eventId = "non-existent-event";
      const userId = "user-updating-progress";
      const progress = 50;

      jest
        .spyOn(specialEventRepository, "findOne")
        .mockResolvedValue(undefined);

      await expect(
        service.updateEventProgress(eventId, userId, progress)
      ).rejects.toThrowError(`Evento con ID ${eventId} no encontrado`);
      expect(specialEventRepository.findOne).toHaveBeenCalledWith({
        where: { id: eventId },
      });
      expect(specialEventRepository.save).not.toHaveBeenCalled();
      expect(awardEventRewardsSpy).not.toHaveBeenCalled();
    });

    it("should throw an error if user is not a participant", async () => {
      const eventId = "event-with-participants";
      const userId = "non-participant-user";
      const progress = 50;
      const mockEvent = {
        id: eventId,
        name: "Event with Participants",
        startDate: new Date(),
        endDate: new Date(new Date().getTime() + 10000),
        isActive: true,
        season: {
          id: "season-1",
          type: "BETSCNATE" as any,
          startDate: new Date(),
          endDate: new Date(),
        },
        rewards: { points: 100 },
        requirements: {},
        culturalElements: { traditions: [], vocabulary: [], activities: [] },
        participants: [
          { userId: "another-user", joinedAt: new Date(), progress: 0 },
        ], // Another participant
      };

      jest
        .spyOn(specialEventRepository, "findOne")
        .mockResolvedValue(mockEvent as any);

      await expect(
        service.updateEventProgress(eventId, userId, progress)
      ).rejects.toThrowError("No estás participando en este evento");
      expect(specialEventRepository.findOne).toHaveBeenCalledWith({
        where: { id: eventId },
      });
      expect(specialEventRepository.save).not.toHaveBeenCalled();
      expect(awardEventRewardsSpy).not.toHaveBeenCalled();
    });

    it("should complete event and award rewards when progress reaches 100%", async () => {
      const eventId = "event-to-complete";
      const userId = "user-completing";
      const progress = 100;
      const mockEvent = {
        id: eventId,
        name: "Completion Event",
        startDate: new Date(),
        endDate: new Date(new Date().getTime() + 10000),
        isActive: true,
        season: {
          id: "season-1",
          type: "BETSCNATE" as any,
          startDate: new Date(),
          endDate: new Date(),
        },
        rewards: { points: 100 },
        requirements: {},
        culturalElements: { traditions: [], vocabulary: [], activities: [] },
        participants: [{ userId, joinedAt: new Date(), progress: 0 }],
      };
      const completedEvent = {
        ...mockEvent,
        participants: [
          {
            userId,
            joinedAt: mockEvent.participants[0].joinedAt,
            progress,
            completedAt: expect.any(Date),
          },
        ],
      };

      jest
        .spyOn(specialEventRepository, "findOne")
        .mockResolvedValue(mockEvent as any);
      jest
        .spyOn(specialEventRepository, "save")
        .mockResolvedValue(completedEvent as any);

      await service.updateEventProgress(eventId, userId, progress);

      expect(specialEventRepository.findOne).toHaveBeenCalledWith({
        where: { id: eventId },
      });
      expect(specialEventRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          participants: expect.arrayContaining([
            expect.objectContaining({
              userId,
              progress,
              completedAt: expect.any(Date),
            }),
          ]),
        })
      );
      expect(awardEventRewardsSpy).toHaveBeenCalledWith(userId, mockEvent);
    });

    it("should not award rewards if event is already completed", async () => {
      const eventId = "already-completed-event";
      const userId = "user-already-completed";
      const progress = 100; // Still 100%
      const mockEvent = {
        id: eventId,
        name: "Completed Event",
        startDate: new Date(),
        endDate: new Date(new Date().getTime() + 10000),
        isActive: true,
        season: {
          id: "season-1",
          type: "BETSCNATE" as any,
          startDate: new Date(),
          endDate: new Date(),
        },
        rewards: { points: 100 },
        requirements: {},
        culturalElements: { traditions: [], vocabulary: [], activities: [] },
        participants: [
          {
            userId,
            joinedAt: new Date(),
            progress: 100,
            completedAt: new Date(),
          },
        ], // Already completed
      };

      jest
        .spyOn(specialEventRepository, "findOne")
        .mockResolvedValue(mockEvent as any);
      jest
        .spyOn(specialEventRepository, "save")
        .mockResolvedValue(mockEvent as any); // Save returns the same event

      await service.updateEventProgress(eventId, userId, progress);

      expect(specialEventRepository.findOne).toHaveBeenCalledWith({
        where: { id: eventId },
      });
      expect(specialEventRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          participants: expect.arrayContaining([
            expect.objectContaining({
              userId,
              progress,
              completedAt: expect.any(Date), // Should still have completedAt
            }),
          ]),
        })
      );
      expect(awardEventRewardsSpy).not.toHaveBeenCalled(); // Should not award again
    });
  });

  describe("awardEventRewards", () => {
    it("should grant points and create user achievement", async () => {
      const userId = "user-to-reward";
      const mockEvent = {
        id: "reward-event",
        name: "Reward Event",
        description: "Event for testing rewards",
        type: "FESTIVAL" as any,
        rewards: {
          points: 200,
          culturalValue: 150,
          specialBadge: { id: "badge-id", name: "Badge Name", icon: "✨" },
        },
        requirements: {},
        culturalElements: { traditions: [], vocabulary: [], activities: [] },
        participants: [],
      };
      const mockGamification = { userId: Number(userId), userAchievements: [] };
      const mockAchievement = {
        name: mockEvent.name,
        description: mockEvent.description,
        criteria: `Participación en ${mockEvent.type}`,
        bonusPoints: mockEvent.rewards.points,
        iconUrl: mockEvent.rewards.specialBadge.icon,
      };
      const mockUserAchievement = {
        achievement: mockAchievement,
        user: mockGamification,
        status: "active",
        dateAwarded: expect.any(Date),
        userId: userId,
      };

      jest
        .spyOn(gamificationService, "findByUserId")
        .mockResolvedValue(mockGamification as any);
      jest
        .spyOn(gamificationService, "awardPoints") // Corregido: usar awardPoints
        .mockResolvedValue(undefined); // Mock the grantPoints call
      jest.spyOn(specialEventRepository, "save").mockResolvedValue(undefined); // Mock the save call

      // Access the private method using bracket notation
      await (service as any).awardEventRewards(userId, mockEvent);

      expect(gamificationService.awardPoints).toHaveBeenCalledWith( // Corregido: usar awardPoints
        Number(userId),
        mockEvent.rewards.points,
        'special_event_completed', // Añadir tipo de actividad
        `¡Evento especial completado: ${mockEvent.name}!` // Añadir descripción
      );
      // Verify that a new UserAchievement was created and added to userAchievements
      expect(mockGamification.userAchievements).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            achievement: expect.objectContaining({
              name: mockEvent.name,
              description: mockEvent.description,
              criteria: `Participación en ${mockEvent.type}`,
              bonusPoints: mockEvent.rewards.points,
              iconUrl: mockEvent.rewards.specialBadge.icon,
            }),
            user: mockGamification,
            status: "active",
            userId: userId,
          }),
        ])
      );
      expect(specialEventRepository.save).toHaveBeenCalled();
    });

    it("should handle event with no special badge reward", async () => {
      const userId = "user-no-badge";
      const mockEvent = {
        id: "reward-event-no-badge",
        name: "No Badge Event",
        description: "Event without a special badge",
        type: "CEREMONIA" as any,
        rewards: { points: 50, culturalValue: 100 }, // No specialBadge
        requirements: {},
        culturalElements: { traditions: [], vocabulary: [], activities: [] },
        participants: [],
      };
      const mockGamification = { userId: Number(userId), userAchievements: [] };

      jest
        .spyOn(gamificationService, "findByUserId")
        .mockResolvedValue(mockGamification as any);
      // jest.spyOn(gamificationService, 'grantPoints').mockResolvedValue(undefined);
      jest.spyOn(specialEventRepository, "save").mockResolvedValue(undefined);

      await (service as any).awardEventRewards(userId, mockEvent);

      // Usar la espía del mockGamificationService
      expect(gamificationService.awardPoints).toHaveBeenCalledWith( // Corregido: usar awardPoints
        Number(userId),
        mockEvent.rewards.points,
        "special_event_completed",
        `¡Evento especial completado: ${mockEvent.name}!`
      );
      // Verify that a new UserAchievement was created even without a badge icon
      expect(mockGamification.userAchievements).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            achievement: expect.objectContaining({
              name: mockEvent.name,
              description: mockEvent.description,
              criteria: `Participación en ${mockEvent.type}`,
              bonusPoints: mockEvent.rewards.points,
              iconUrl: undefined, // iconUrl should be undefined
            }),
            user: mockGamification,
            status: "active",
            userId: userId,
          }),
        ])
      );
      expect(specialEventRepository.save).toHaveBeenCalled();
    });
  });

  describe("generateSeasonEvents", () => {
    it("should generate events for BETSCNATE season type", async () => {
      const season = {
        id: "season-betscnate",
        type: "betscnate" as any,
        startDate: new Date(),
        endDate: new Date(),
      };
      // Spy on the public method createSpecialEvent
      const createSpecialEventSpy = jest
        .spyOn(service, "createSpecialEvent")
        .mockResolvedValue(undefined as any);

      await service.generateSeasonEvents(season as any);

      // Expect createSpecialEvent to be called twice for BETSCNATE templates
      expect(createSpecialEventSpy).toHaveBeenCalledTimes(2);
      expect(createSpecialEventSpy).toHaveBeenCalledWith(
        season.id,
        expect.objectContaining({ name: "Gran Celebración del Bëtscnaté" })
      );
      expect(createSpecialEventSpy).toHaveBeenCalledWith(
        season.id,
        expect.objectContaining({ name: "Concurso de disfraces del Bëtscnaté" })
      );
    });

    it("should generate events for JAJAN season type", async () => {
      const season = {
        id: "season-jajan",
        type: "jajan" as any,
        startDate: new Date(),
        endDate: new Date(),
      };
      // Spy on the public method createSpecialEvent
      const createSpecialEventSpy = jest
        .spyOn(service, "createSpecialEvent")
        .mockResolvedValue(undefined as any);

      await service.generateSeasonEvents(season as any);

      // Expect createSpecialEvent to be called twice for JAJAN templates
      expect(createSpecialEventSpy).toHaveBeenCalledTimes(2);
      expect(createSpecialEventSpy).toHaveBeenCalledWith(
        season.id,
        expect.objectContaining({ name: "Festival de la Siembra" })
      );
      expect(createSpecialEventSpy).toHaveBeenCalledWith(
        season.id,
        expect.objectContaining({ name: "Concurso de Canto a la Tierra" })
      );
    });

    it("should not generate events for unknown season type", async () => {
      const season = {
        id: "season-unknown",
        type: "UNKNOWN_SEASON" as any,
        startDate: new Date(),
        endDate: new Date(),
      };
      // Mock the save method which is called inside createSpecialEvent
      jest
        .spyOn(specialEventRepository, "save")
        .mockResolvedValue(undefined as any);
      // Mock the create method which is also called inside createSpecialEvent
      jest
        .spyOn(specialEventRepository, "create")
        .mockImplementation((data) => data as any);

      await service.generateSeasonEvents(season as any);

      // Expect specialEventRepository.create not to be called
      expect(specialEventRepository.create).not.toHaveBeenCalled();
      expect(specialEventRepository.save).not.toHaveBeenCalled();
    });
  });
});
