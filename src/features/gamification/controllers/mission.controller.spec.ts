import { Test, TestingModule } from '@nestjs/testing';
import { MissionController } from './mission.controller';
import { MissionService } from '../services/mission.service';
import { CreateMissionDto } from '../dto/create-mission.dto';
import { UpdateMissionDto } from '../dto/update-mission.dto';
import { Mission, MissionType, MissionFrequency } from '../entities/mission.entity'; // Importar MissionType y MissionFrequency
import { AuthGuard } from '@nestjs/passport';
import { NotFoundException } from '@nestjs/common';

describe('MissionController', () => {
  let controller: MissionController;
  let service: MissionService;

  const mockMissionService = {
    createMission: jest.fn(),
    getActiveMissions: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MissionController],
      providers: [
        {
          provide: MissionService,
          useValue: mockMissionService,
        },
      ],
    })
    .overrideGuard(AuthGuard('jwt')) // Sobrescribir el guard JWT
    .useValue({ canActivate: () => true }) // Permitir siempre el acceso para pruebas de controlador
    .compile();

    controller = module.get<MissionController>(MissionController);
    service = module.get<MissionService>(MissionService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new mission', async () => {
      const createMissionDto: CreateMissionDto = {
        title: 'New Mission', // Usar title
        description: 'Mission Description',
        type: MissionType.COMPLETE_LESSONS, // Usar enum
        frequency: MissionFrequency.DAILY, // Usar enum
        targetValue: 10,
        rewardPoints: 50,
        startDate: new Date(),
        endDate: new Date(),
        // Incluir propiedades opcionales si son relevantes para el test
        // criteria no existe en CreateMissionDto
        rewardBadge: { id: 'badge-uuid', name: 'New Badge', icon: 'icon.png' },
        bonusConditions: [{ condition: 'test', multiplier: 1.5 }], // bonusConditions en DTO no tiene description
        completedBy: [], // completedBy en DTO es opcional y puede ser []
      };
      const expectedMission: Mission = {
        id: 'some-uuid',
        title: createMissionDto.title,
        description: createMissionDto.description,
        type: createMissionDto.type,
        frequency: createMissionDto.frequency,
        targetValue: createMissionDto.targetValue,
        rewardPoints: createMissionDto.rewardPoints,
        startDate: createMissionDto.startDate,
        endDate: createMissionDto.endDate,
        criteria: { type: 'lessonCount', value: 10, description: 'Complete 10 lessons' }, // criteria existe en Mission (entidad)
        rewardBadge: createMissionDto.rewardBadge,
        participants: [], // Propiedad de entidad
        completedBy: [], // completedBy en entidad tiene completedAt obligatorio
        bonusConditions: [{ condition: 'test', multiplier: 1.5, description: 'Test bonus' }], // bonusConditions en entidad tiene description
        season: undefined, // Propiedad de entidad
      };

      mockMissionService.createMission.mockResolvedValue(expectedMission);

      const result = await controller.create(createMissionDto);

      expect(result).toEqual(expectedMission);
      expect(mockMissionService.createMission).toHaveBeenCalledWith(createMissionDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of active missions for a user', async () => {
      const userId = 'test-user-id';
      const req = { user: { id: userId } };
      const expectedMissions: Mission[] = [
        { id: 'm1', title: 'Mission 1', description: 'Desc 1', type: MissionType.COMPLETE_LESSONS, frequency: MissionFrequency.DAILY, targetValue: 5, rewardPoints: 10, startDate: new Date(), endDate: new Date(), criteria: { type: 'lessonCount', value: 5, description: 'Complete 5 lessons' }, rewardBadge: undefined, participants: [], completedBy: [], bonusConditions: [], season: undefined }, // Usar title y estructura de entidad, añadir criteria
        { id: 'm2', title: 'Mission 2', description: 'Desc 2', type: MissionType.EARN_POINTS, frequency: MissionFrequency.WEEKLY, targetValue: 100, rewardPoints: 20, startDate: new Date(), endDate: new Date(), criteria: { type: 'pointsEarned', value: 100, description: 'Earn 100 points' }, rewardBadge: undefined, participants: [], completedBy: [], bonusConditions: [], season: undefined }, // Usar title y estructura de entidad, añadir criteria
      ];

      mockMissionService.getActiveMissions.mockResolvedValue(expectedMissions);

      const result = await controller.findAll(req);

      expect(result).toEqual(expectedMissions);
      expect(mockMissionService.getActiveMissions).toHaveBeenCalledWith(userId);
    });
  });

  describe('findOne', () => {
    it('should return a mission by ID', async () => {
      const missionId = 'test-id';
      const expectedMission: Mission = {
        id: missionId,
        title: 'Test Mission', // Usar title
        description: 'Description',
        type: MissionType.COMPLETE_LESSONS, // Usar enum
        frequency: MissionFrequency.DAILY, // Usar enum
        targetValue: 10,
        rewardPoints: 100,
        startDate: new Date(),
        endDate: new Date(),
        criteria: { type: 'lessonCount', value: 10, description: 'Complete 10 lessons' }, // Añadir criteria
        rewardBadge: undefined,
        participants: [],
        completedBy: [],
        bonusConditions: [],
        season: undefined,
      };
      mockMissionService.findOne.mockResolvedValue(expectedMission);

      const result = await controller.findOne(missionId);

      expect(result).toEqual(expectedMission);
      expect(mockMissionService.findOne).toHaveBeenCalledWith(missionId);
    });

    it('should throw NotFoundException when mission not found', async () => {
      const missionId = 'non-existent-id';
      mockMissionService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(missionId)).rejects.toThrow(NotFoundException);
      expect(mockMissionService.findOne).toHaveBeenCalledWith(missionId);
    });
  });

  describe('update', () => {
    it('should update a mission', async () => {
      const missionId = 'test-id';
      const updateMissionDto: UpdateMissionDto = { title: 'Updated Mission' }; // Usar title
      const expectedMission: Mission = {
        id: missionId,
        title: 'Updated Mission', // Usar title
        description: 'Old Description',
        type: MissionType.COMPLETE_LESSONS,
        frequency: MissionFrequency.DAILY,
        targetValue: 10,
        rewardPoints: 50,
        startDate: new Date(),
        endDate: new Date(),
        criteria: { type: 'lessonCount', value: 10, description: 'Complete 10 lessons' }, // Añadir criteria
        rewardBadge: undefined,
        participants: [],
        completedBy: [],
        bonusConditions: [],
        season: undefined,
      };

      mockMissionService.update.mockResolvedValue(expectedMission);

      const result = await controller.update(missionId, updateMissionDto);

      expect(result).toEqual(expectedMission);
      expect(mockMissionService.update).toHaveBeenCalledWith(missionId, updateMissionDto);
    });

    it('should throw NotFoundException when mission to update not found', async () => {
      const missionId = 'non-existent-id';
      const updateMissionDto: UpdateMissionDto = { title: 'Updated Mission' }; // Usar title
      mockMissionService.update.mockRejectedValue(new NotFoundException());

      await expect(controller.update(missionId, updateMissionDto)).rejects.toThrow(NotFoundException);
      expect(mockMissionService.update).toHaveBeenCalledWith(missionId, updateMissionDto);
    });
  });

  describe('remove', () => {
    it('should remove a mission', async () => {
      const missionId = 'test-id';
      mockMissionService.remove.mockResolvedValue(undefined); // remove returns void

      await controller.remove(missionId);

      expect(mockMissionService.remove).toHaveBeenCalledWith(missionId);
    });

    it('should throw NotFoundException when mission to remove not found', async () => {
      const missionId = 'non-existent-id';
      mockMissionService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove(missionId)).rejects.toThrow(NotFoundException);
      expect(mockMissionService.remove).toHaveBeenCalledWith(missionId);
    });
  });
});
