import { Test, TestingModule } from '@nestjs/testing';
import { SpecialEventService } from './special-event.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { SpecialEvent } from '../entities/special-event.entity';
import { Season } from '../entities/season.entity';
import { GamificationService } from './gamification.service';
import { Achievement } from '../entities/achievement.entity';

describe('SpecialEventService', () => {
  let service: SpecialEventService;
  let specialEventRepository: Repository<SpecialEvent>;
  let seasonRepository: Repository<Season>;
  let gamificationService: GamificationService;
  let achievementRepository: Repository<Achievement>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SpecialEventService,
        {
          provide: getRepositoryToken(SpecialEvent),
          useValue: { // Mock SpecialEventRepository
            findOne: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Season),
          useValue: { // Mock SeasonRepository
            findOne: jest.fn(),
          },
        },
        {
          provide: GamificationService,
          useValue: { // Mock GamificationService
            findByUserId: jest.fn(),
            grantPoints: jest.fn(),
            // Add other methods used by SpecialEventService here
          },
        },
        {
          provide: getRepositoryToken(Achievement),
          useValue: { // Mock AchievementRepository (add methods if needed)
            // findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SpecialEventService>(SpecialEventService);
    specialEventRepository = module.get<Repository<SpecialEvent>>(getRepositoryToken(SpecialEvent));
    seasonRepository = module.get<Repository<Season>>(getRepositoryToken(Season));
    gamificationService = module.get<GamificationService>(GamificationService);
    achievementRepository = module.get<Repository<Achievement>>(getRepositoryToken(Achievement));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getActiveEvents', () => {
    it('should return active events within the date range', async () => {
      const now = new Date();
      const activeEvent1 = {
        id: 'event-1',
        name: 'Active Event 1',
        startDate: new Date(now.getTime() - 10000), // Started 10 seconds ago
        endDate: new Date(now.getTime() + 10000), // Ends in 10 seconds
        isActive: true,
        season: { id: 'season-1', type: 'BETSCNATE' as any, startDate: new Date(), endDate: new Date() },
        rewards: {}, requirements: {}, culturalElements: { traditions: [], vocabulary: [], activities: [] }, participants: []
      };
      const activeEvent2 = {
        id: 'event-2',
        name: 'Active Event 2',
        startDate: new Date(now.getTime() - 20000), // Started 20 seconds ago
        endDate: new Date(now.getTime() + 20000), // Ends in 20 seconds
        isActive: true,
        season: { id: 'season-2', type: 'JAJAN' as any, startDate: new Date(), endDate: new Date() },
        rewards: {}, requirements: {}, culturalElements: { traditions: [], vocabulary: [], activities: [] }, participants: []
      };
      const inactiveEvent = {
        id: 'event-3',
        name: 'Inactive Event',
        startDate: new Date(now.getTime() - 10000),
        endDate: new Date(now.getTime() + 10000),
        isActive: false, // Inactive
        season: { id: 'season-3', type: 'BETSCNATE' as any, startDate: new Date(), endDate: new Date() },
        rewards: {}, requirements: {}, culturalElements: { traditions: [], vocabulary: [], activities: [] }, participants: []
      };
      const futureEvent = {
        id: 'event-4',
        name: 'Future Event',
        startDate: new Date(now.getTime() + 10000), // Starts in the future
        endDate: new Date(now.getTime() + 20000),
        isActive: true,
        season: { id: 'season-4', type: 'JAJAN' as any, startDate: new Date(), endDate: new Date() },
        rewards: {}, requirements: {}, culturalElements: { traditions: [], vocabulary: [], activities: [] }, participants: []
      };
      const pastEvent = {
        id: 'event-5',
        name: 'Past Event',
        startDate: new Date(now.getTime() - 20000),
        endDate: new Date(now.getTime() - 10000), // Ended in the past
        isActive: true,
        season: { id: 'season-5', type: 'BETSCNATE' as any, startDate: new Date(), endDate: new Date() },
        rewards: {}, requirements: {}, culturalElements: { traditions: [], vocabulary: [], activities: [] }, participants: []
      };

      const mockEvents = [activeEvent1, activeEvent2, inactiveEvent, futureEvent, pastEvent];

      jest.spyOn(specialEventRepository, 'find').mockResolvedValue([activeEvent1, activeEvent2] as any); // Only return active ones

      const result = await service.getActiveEvents();

      expect(specialEventRepository.find).toHaveBeenCalledWith({
        where: {
          startDate: LessThanOrEqual(expect.any(Date)), // Use matcher
          endDate: MoreThanOrEqual(expect.any(Date)), // Use matcher
          isActive: true
        },
        relations: ['season']
      });
      expect(result).toEqual([activeEvent1, activeEvent2]);
    });

    it('should return an empty array if no active events are found', async () => {
      jest.spyOn(specialEventRepository, 'find').mockResolvedValue([]);

      const result = await service.getActiveEvents();

      expect(specialEventRepository.find).toHaveBeenCalled(); // Check if find was called
      expect(result).toEqual([]);
    });
  });

  describe('joinEvent', () => {
    it('should add a participant to the event', async () => {
      const eventId = 'event-to-join';
      const userId = 'user-joining';
      const mockEvent = {
        id: eventId,
        name: 'Joinable Event',
        startDate: new Date(),
        endDate: new Date(new Date().getTime() + 10000),
        isActive: true,
        season: { id: 'season-1', type: 'BETSCNATE' as any, startDate: new Date(), endDate: new Date() },
        rewards: {},
        requirements: { culturalAchievements: [] }, // No cultural achievement requirements
        culturalElements: { traditions: [], vocabulary: [], activities: [] },
        participants: [] // Initially empty
      };
      const mockGamification = { userId: Number(userId), userAchievements: [] };

      jest.spyOn(specialEventRepository, 'findOne').mockResolvedValue(mockEvent as any);
      jest.spyOn(gamificationService, 'findByUserId').mockResolvedValue(mockGamification as any);
      jest.spyOn(specialEventRepository, 'save').mockResolvedValue({ ...mockEvent, participants: [{ userId, joinedAt: expect.any(Date), progress: 0 }] } as any);

      await service.joinEvent(eventId, userId);

      expect(specialEventRepository.findOne).toHaveBeenCalledWith({ where: { id: eventId } });
      expect(gamificationService.findByUserId).toHaveBeenCalledWith(Number(userId));
      expect(specialEventRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        participants: expect.arrayContaining([
          expect.objectContaining({
            userId,
            progress: 0
          })
        ])
      }));
    });

    it('should throw NotFoundException if event is not found', async () => {
      const eventId = 'non-existent-event';
      const userId = 'user-joining';

      jest.spyOn(specialEventRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.joinEvent(eventId, userId)).rejects.toThrowError(
        `Evento con ID ${eventId} no encontrado`
      );
      expect(specialEventRepository.findOne).toHaveBeenCalledWith({ where: { id: eventId } });
      expect(gamificationService.findByUserId).not.toHaveBeenCalled();
      expect(specialEventRepository.save).not.toHaveBeenCalled();
    });

    it('should throw an error if cultural achievement requirements are not met', async () => {
      const eventId = 'event-with-requirements';
      const userId = 'user-joining';
      const mockEvent = {
        id: eventId,
        name: 'Event with Requirements',
        startDate: new Date(),
        endDate: new Date(new Date().getTime() + 10000),
        isActive: true,
        season: { id: 'season-1', type: 'BETSCNATTE' as any, startDate: new Date(), endDate: new Date() },
        rewards: {},
        requirements: { culturalAchievements: ['required-achievement-id'] }, // Requires this achievement
        culturalElements: { traditions: [], vocabulary: [], activities: [] },
        participants: []
      };
      const mockGamification = { userId: Number(userId), userAchievements: [] }; // User has no achievements

      jest.spyOn(specialEventRepository, 'findOne').mockResolvedValue(mockEvent as any);
      jest.spyOn(gamificationService, 'findByUserId').mockResolvedValue(mockGamification as any);

      await expect(service.joinEvent(eventId, userId)).rejects.toThrowError(
        'No cumples con los logros culturales requeridos'
      );
      expect(specialEventRepository.findOne).toHaveBeenCalledWith({ where: { id: eventId } });
      expect(gamificationService.findByUserId).toHaveBeenCalledWith(Number(userId));
      expect(specialEventRepository.save).not.toHaveBeenCalled();
    });

    it('should add participant if cultural achievement requirements are met', async () => {
      const eventId = 'event-with-requirements';
      const userId = 'user-joining';
      const mockEvent = {
        id: eventId,
        name: 'Event with Requirements',
        startDate: new Date(),
        endDate: new Date(new Date().getTime() + 10000),
        isActive: true,
        season: { id: 'season-1', type: 'BETSCNATTE' as any, startDate: new Date(), endDate: new Date() },
        rewards: {},
        requirements: { culturalAchievements: ['required-achievement-id'] }, // Requires this achievement
        culturalElements: { traditions: [], vocabulary: [], activities: [] },
        participants: []
      };
      const mockGamification = {
        userId: Number(userId),
        userAchievements: [{ achievementId: 'required-achievement-id' }]
      }; // User has the required achievement

      jest.spyOn(specialEventRepository, 'findOne').mockResolvedValue(mockEvent as any);
      jest.spyOn(gamificationService, 'findByUserId').mockResolvedValue(mockGamification as any);
      jest.spyOn(specialEventRepository, 'save').mockResolvedValue({ ...mockEvent, participants: [{ userId, joinedAt: expect.any(Date), progress: 0 }] } as any);

      await service.joinEvent(eventId, userId);

      expect(specialEventRepository.findOne).toHaveBeenCalledWith({ where: { id: eventId } });
      expect(gamificationService.findByUserId).toHaveBeenCalledWith(Number(userId));
      expect(specialEventRepository.save).toHaveBeenCalledWith(expect.objectContaining({
        participants: expect.arrayContaining([
          expect.objectContaining({
            userId,
            progress: 0
          })
        ])
      }));
    });
  });

  describe('createSpecialEvent', () => {
    it('should create a special event successfully', async () => {
      const seasonId = 'test-season-id';
      const eventData = {
        name: 'Test Event',
        description: 'A test event',
        type: 'FESTIVAL' as any, // Use a valid EventType
        rewards: { points: 100, culturalValue: 50 },
        requirements: {},
        culturalElements: { traditions: [], vocabulary: [], activities: [] }, // Corregido
        startDate: new Date(),
        endDate: new Date(),
        isActive: true,
        participants: []
      };
      const mockSeason = { id: seasonId, type: 'BETSCNATE' as any, startDate: new Date(), endDate: new Date() };
      const mockEvent = { ...eventData, season: mockSeason };

      jest.spyOn(seasonRepository, 'findOne').mockResolvedValue(mockSeason as any);
      jest.spyOn(specialEventRepository, 'create').mockReturnValue(mockEvent as any);
      jest.spyOn(specialEventRepository, 'save').mockResolvedValue(mockEvent as any);

      const result = await service.createSpecialEvent(seasonId, eventData);

      expect(seasonRepository.findOne).toHaveBeenCalledWith({ where: { id: seasonId } });
      expect(specialEventRepository.create).toHaveBeenCalledWith({ ...eventData, season: mockSeason });
      expect(specialEventRepository.save).toHaveBeenCalledWith(mockEvent);
      expect(result).toEqual(mockEvent);
    });

    it('should throw NotFoundException if season is not found', async () => {
      const seasonId = 'non-existent-season-id';
      const eventData = {
        name: 'Test Event',
        description: 'A test event',
        type: 'FESTIVAL' as any,
        rewards: { points: 100, culturalValue: 50 },
        requirements: {},
        culturalElements: { traditions: [], vocabulary: [], activities: [] }, // Corregido
        startDate: new Date(),
        endDate: new Date(),
        isActive: true,
        participants: []
      };

      jest.spyOn(seasonRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.createSpecialEvent(seasonId, eventData)).rejects.toThrowError(
        `Temporada con ID ${seasonId} no encontrada`
      );
      expect(seasonRepository.findOne).toHaveBeenCalledWith({ where: { id: seasonId } });
      expect(specialEventRepository.create).not.toHaveBeenCalled();
      expect(specialEventRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('updateSpecialEvent', () => {
    it('should update a special event successfully', async () => {
      const eventId = 'event-to-update';
      const updateData = {
        name: 'Updated Event Name',
        description: 'Updated description',
        isActive: false,
      };
      const mockEvent = {
        id: eventId,
        name: 'Original Name',
        description: 'Original description',
        isActive: true,
        season: { id: 'season-1', type: 'BETSCNATE' as any, startDate: new Date(), endDate: new Date() },
        rewards: {}, requirements: {}, culturalElements: { traditions: [], vocabulary: [], activities: [] }, participants: []
      };
      const updatedEvent = { ...mockEvent, ...updateData };

      jest.spyOn(specialEventRepository, 'findOne').mockResolvedValue(mockEvent as any);
      jest.spyOn(specialEventRepository, 'save').mockResolvedValue(updatedEvent as any);

      const result = await service.updateSpecialEvent(eventId, updateData);

      expect(specialEventRepository.findOne).toHaveBeenCalledWith({ where: { id: eventId } });
      expect(specialEventRepository.save).toHaveBeenCalledWith(updatedEvent);
      expect(result).toEqual(updatedEvent);
    });

    it('should throw NotFoundException if event is not found', async () => {
      const eventId = 'non-existent-event';
      const updateData = { name: 'Updated Name' };

      jest.spyOn(specialEventRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.updateSpecialEvent(eventId, updateData)).rejects.toThrowError(
        `Evento con ID ${eventId} no encontrado`
      );
      expect(specialEventRepository.findOne).toHaveBeenCalledWith({ where: { id: eventId } });
      expect(specialEventRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('deleteSpecialEvent', () => {
    it('should delete a special event successfully', async () => {
      const eventId = 'event-to-delete';
      const mockEvent = {
        id: eventId,
        name: 'Event to Delete',
        startDate: new Date(),
        endDate: new Date(),
        isActive: true,
        season: { id: 'season-1', type: 'BETSCNATE' as any, startDate: new Date(), endDate: new Date() },
        rewards: {}, requirements: {}, culturalElements: { traditions: [], vocabulary: [], activities: [] }, participants: []
      };

      jest.spyOn(specialEventRepository, 'findOne').mockResolvedValue(mockEvent as any);
      jest.spyOn(specialEventRepository, 'remove').mockResolvedValue(mockEvent as any);

      await service.deleteSpecialEvent(eventId);

      expect(specialEventRepository.findOne).toHaveBeenCalledWith({ where: { id: eventId } });
      expect(specialEventRepository.remove).toHaveBeenCalledWith(mockEvent);
    });

    it('should throw NotFoundException if event is not found', async () => {
      const eventId = 'non-existent-event';

      jest.spyOn(specialEventRepository, 'findOne').mockResolvedValue(undefined);

      await expect(service.deleteSpecialEvent(eventId)).rejects.toThrowError(
        `Evento con ID ${eventId} no encontrado`
      );
      expect(specialEventRepository.findOne).toHaveBeenCalledWith({ where: { id: eventId } });
      expect(specialEventRepository.remove).not.toHaveBeenCalled();
    });
  });

});
