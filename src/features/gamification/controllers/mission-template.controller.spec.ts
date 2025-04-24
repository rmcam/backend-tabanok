import { Test, TestingModule } from '@nestjs/testing';
import { MissionTemplateController } from './mission-template.controller';
import { MissionTemplateService } from '../services/mission-template.service';
import { JwtAuthGuard } from '../../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../../auth/guards/roles.guard';
import { CreateMissionTemplateDto, UpdateMissionTemplateDto } from '../dto/mission-template.dto';
import { MissionTemplate, MissionFrequency } from '../entities/mission-template.entity'; // Import MissionFrequency here
import { MissionType } from '../entities/mission.entity'; // Import MissionType from its source
import { NotFoundException } from '@nestjs/common';

const mockMissionTemplateService = {
  findAll: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn(),
};

describe('MissionTemplateController', () => {
  let controller: MissionTemplateController;
  let service: MissionTemplateService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MissionTemplateController],
      providers: [
        { provide: MissionTemplateService, useValue: mockMissionTemplateService },
      ],
    })
    .overrideGuard(JwtAuthGuard)
    .useValue({ canActivate: () => true })
    .overrideGuard(RolesGuard)
    .useValue({ canActivate: () => true }) // Assume admin for tests
    .compile();

    controller = module.get<MissionTemplateController>(MissionTemplateController);
    service = module.get<MissionTemplateService>(MissionTemplateService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of mission templates', async () => {
      const expectedResult: MissionTemplate[] = []; // Add sample data if needed
      mockMissionTemplateService.findAll.mockResolvedValue(expectedResult);
      expect(await controller.findAll()).toBe(expectedResult);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single mission template', async () => {
      const id = 'template-uuid';
      const expectedResult = new MissionTemplate(); // Add sample data if needed
      mockMissionTemplateService.findOne.mockResolvedValue(expectedResult);
      expect(await controller.findOne(id)).toBe(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(id);
    });

    it('should throw NotFoundException if template not found', async () => {
      const id = 'invalid-uuid';
      mockMissionTemplateService.findOne.mockRejectedValue(new NotFoundException());
      await expect(controller.findOne(id)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create a mission template', async () => {
      const createDto: CreateMissionTemplateDto = {
        name: 'Earn Points Daily', // Updated name
        description: 'Earn points every day', // Updated description
        type: MissionType.EARN_POINTS, // Corrected Enum Value
        frequency: MissionFrequency.DIARIA,
        pointsReward: 5,
        objectives: [{ description: 'Earn 10 points', type: 'earn_points', targetValue: 10 }], // Updated objective
      };
      const expectedResult = new MissionTemplate(); // Add sample data if needed
      mockMissionTemplateService.create.mockResolvedValue(expectedResult);
      expect(await controller.create(createDto)).toBe(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update a mission template', async () => {
      const id = 'template-uuid';
      const updateDto: UpdateMissionTemplateDto = { description: 'Updated description' };
      const expectedResult = new MissionTemplate(); // Add sample data if needed
      mockMissionTemplateService.update.mockResolvedValue(expectedResult);
      expect(await controller.update(id, updateDto)).toBe(expectedResult);
      expect(service.update).toHaveBeenCalledWith(id, updateDto);
    });

     it('should throw NotFoundException if template not found', async () => {
      const id = 'invalid-uuid';
      const updateDto: UpdateMissionTemplateDto = { description: 'Updated description' };
      mockMissionTemplateService.update.mockRejectedValue(new NotFoundException());
      await expect(controller.update(id, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove a mission template', async () => {
      const id = 'template-uuid';
      mockMissionTemplateService.remove.mockResolvedValue(undefined);
      await controller.remove(id);
      expect(service.remove).toHaveBeenCalledWith(id);
    });

     it('should throw NotFoundException if template not found', async () => {
      const id = 'invalid-uuid';
      mockMissionTemplateService.remove.mockRejectedValue(new NotFoundException());
      await expect(controller.remove(id)).rejects.toThrow(NotFoundException);
    });
  });
});
