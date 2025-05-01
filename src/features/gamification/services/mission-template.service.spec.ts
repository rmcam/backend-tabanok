import { NotFoundException } from "@nestjs/common"; // Import NotFoundException
import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { MissionTemplate, MissionFrequency } from "../entities/mission-template.entity"; // Import MissionTemplate and MissionFrequency from mission-template.entity
import { MissionType } from "../entities/mission.entity"; // Import MissionType from mission.entity
import { MissionTemplateService } from "./mission-template.service";

describe("MissionTemplateService", () => {
  let service: MissionTemplateService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      // Mock methods used by the service
      create: jest.fn((dto) => dto),
      save: jest.fn((mission) => Promise.resolve(mission)),
      findOne: jest.fn(),
      find: jest.fn(),
      delete: jest.fn(),
      remove: jest.fn(), // Mock remove method
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MissionTemplateService,
        {
          provide: getRepositoryToken(MissionTemplate),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<MissionTemplateService>(MissionTemplateService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a new mission template", async () => {
      const createData: Partial<MissionTemplate> = {
        title: "Test Template",
        description: "Test Description",
      }; // Changed from name to title
      const expectedTemplate = { id: "some-uuid", ...createData };

      mockRepository.save.mockResolvedValue(expectedTemplate);

      const result = await service.create(createData);

      expect(result).toEqual(expectedTemplate);
      expect(mockRepository.create).toHaveBeenCalledWith(createData);
      expect(mockRepository.save).toHaveBeenCalledWith(createData);
    });
  });

  describe("findAll", () => {
    it("should return an array of mission templates", async () => {
      const templateArray: MissionTemplate[] = [
        {
          id: "1",
          title: "Template 1",
          description: "Desc 1",
          type: MissionType.COMPLETE_LESSONS, // Changed from INDIVIDUAL to COMPLETE_LESSONS
          frequency: MissionFrequency.DIARIA, // Changed from DIARIA to DAILY
          rewards: [],
          isActive: true,
          minLevel: 1,
          maxLevel: 100,
          baseTargetValue: 1,
          baseRewardPoints: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        }, // Changed name to title and added required properties
        {
          id: "2",
          title: "Template 2",
          description: "Desc 2",
          type: MissionType.COMPLETE_LESSONS, // Changed from INDIVIDUAL to COMPLETE_LESSONS
          frequency: MissionFrequency.DIARIA, // Changed from DIARIA to DAILY
          rewards: [],
          isActive: true,
          minLevel: 1,
          maxLevel: 100,
          baseTargetValue: 1,
          baseRewardPoints: 10,
          createdAt: new Date(),
          updatedAt: new Date(),
        }, // Changed name to title and added required properties
      ]; // Specify type and add required properties
      mockRepository.find.mockResolvedValue(templateArray);

      const result = await service.findAll();

      expect(result).toEqual(templateArray);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("should return a mission template by id", async () => {
      const templateId = "test-id";
      const expectedTemplate: MissionTemplate = {
        id: templateId,
        title: "Test Template", // Changed from name to title
        description: "Desc",
        type: MissionType.COMPLETE_LESSONS, // Changed from INDIVIDUAL to COMPLETE_LESSONS
        frequency: MissionFrequency.DIARIA, // Changed from DIARIA to DAILY
        rewards: [], // rewards is a JSON column
        isActive: true,
        minLevel: 1, // Added required property
        maxLevel: 100, // Added required property
        baseTargetValue: 1, // Added required property
        baseRewardPoints: 10, // Added required property
        createdAt: new Date(),
        updatedAt: new Date(),
      }; // Specify type and add required properties
      mockRepository.findOne.mockResolvedValue(expectedTemplate);

      const result = await service.findOne(templateId);

      expect(result).toEqual(expectedTemplate);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: templateId },
      });
    });
  });

  describe("update", () => {
    it("should update a mission template", async () => {
      const templateId = "test-id";
      const updateData: Partial<MissionTemplate> = {
        title: "Updated Template",
      }; // Changed from name to title
      const existingTemplate: MissionTemplate = {
        id: templateId,
        title: "Old Name",
        description: "Old Desc",
        type: MissionType.COMPLETE_LESSONS, // Changed from INDIVIDUAL to COMPLETE_LESSONS
        frequency: MissionFrequency.DIARIA, // Changed from DIARIA to DAILY
        rewards: [],
        isActive: true,
        minLevel: 1,
        maxLevel: 100,
        baseTargetValue: 1,
        baseRewardPoints: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      }; // Changed name to title and added required properties
      const updatedTemplate = { ...existingTemplate, ...updateData };

      mockRepository.findOne.mockResolvedValue(existingTemplate);
      mockRepository.save.mockResolvedValue(updatedTemplate);

      const result = await service.update(templateId, updateData);

      expect(result).toEqual(updatedTemplate);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: templateId },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateData)
      ); // Check if save was called with updated data
    });

    it("should throw NotFoundException when template to update not found", async () => {
      const templateId = "non-existent-id";
      const updateData: Partial<MissionTemplate> = {
        title: "Updated Template",
      }; // Changed from name to title
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.update(templateId, updateData)).rejects.toThrow(
        NotFoundException
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: templateId },
      });
    });
  });

  describe("remove", () => {
    it("should remove a mission template", async () => {
      const templateId = "test-id";
      const existingTemplate: MissionTemplate = {
        id: templateId,
        title: "Test Template",
        description: "Desc",
        type: MissionType.COMPLETE_LESSONS, // Changed from INDIVIDUAL to COMPLETE_LESSONS
        frequency: MissionFrequency.DIARIA, // Changed from DIARIA to DAILY
        rewards: [],
        isActive: true,
        minLevel: 1,
        maxLevel: 100,
        baseTargetValue: 1,
        baseRewardPoints: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      }; // Changed name to title and added required properties
      mockRepository.findOne.mockResolvedValue(existingTemplate);
      mockRepository.remove.mockResolvedValue(undefined); // Mock remove method

      await service.remove(templateId);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: templateId },
      });
      expect(mockRepository.remove).toHaveBeenCalledWith(existingTemplate);
    });

    it("should throw NotFoundException when template to remove not found", async () => {
      const templateId = "non-existent-id";
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.remove(templateId)).rejects.toThrow(
        NotFoundException
      );
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: templateId },
      });
    });
  });
});
