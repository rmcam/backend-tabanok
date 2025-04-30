import { Test, TestingModule } from "@nestjs/testing";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ModuleService } from "./module.service";
import { Module } from "./entities/module.entity";
import { CreateModuleDto } from "./dto/create-module.dto";
import { UpdateModuleDto } from "./dto/update-module.dto";
import { NotFoundException } from "@nestjs/common";
import { Unity } from "../unity/entities/unity.entity"; // Assuming Unity entity exists

describe("ModuleService", () => {
  let service: ModuleService;
  let moduleRepository: Repository<Module>;

  const mockModuleRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ModuleService,
        {
          provide: getRepositoryToken(Module),
          useValue: mockModuleRepository,
        },
      ],
    }).compile();

    service = module.get<ModuleService>(ModuleService);
    moduleRepository = module.get<Repository<Module>>(
      getRepositoryToken(Module)
    );

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a new module", async () => {
      const createModuleDto: CreateModuleDto = {
        name: "Test Module",
        description: "Module description",
        // Add other required properties from CreateModuleDto
      };
      const expectedModule = { id: "some-uuid", ...createModuleDto };

      mockModuleRepository.create.mockReturnValue(createModuleDto);
      mockModuleRepository.save.mockResolvedValue(expectedModule);

      const result = await service.create(createModuleDto);

      expect(result).toEqual(expectedModule);
      expect(mockModuleRepository.create).toHaveBeenCalledWith(createModuleDto);
      expect(mockModuleRepository.save).toHaveBeenCalledWith(createModuleDto);
    });
  });

  describe("findAll", () => {
    it("should return an array of modules", async () => {
      const moduleArray: Module[] = [
        { id: "1", name: "Module 1", description: "Desc 1", unities: [] },
        { id: "2", name: "Module 2", description: "Desc 2", unities: [] },
      ];
      mockModuleRepository.find.mockResolvedValue(moduleArray);

      const result = await service.findAll();

      expect(result).toEqual(moduleArray);
      expect(mockModuleRepository.find).toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("should return a module by id", async () => {
      const moduleId = "test-id";
      const expectedModule: Module = {
        id: moduleId,
        name: "Test Module",
        description: "Description",
        unities: [],
      };
      mockModuleRepository.findOne.mockResolvedValue(expectedModule);

      const result = await service.findOne(moduleId);

      expect(result).toEqual(expectedModule);
      expect(mockModuleRepository.findOne).toHaveBeenCalledWith({
        where: { id: moduleId },
      });
    });

    it("should throw NotFoundException when module not found", async () => {
      const moduleId = "non-existent-id";
      mockModuleRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(moduleId)).rejects.toThrow(NotFoundException);
      expect(mockModuleRepository.findOne).toHaveBeenCalledWith({
        where: { id: moduleId },
      });
    });
  });

  describe("update", () => {
    it("should update a module", async () => {
      const moduleId = "test-id";
      const updateModuleDto: UpdateModuleDto = { name: "Updated Module" };
      const existingModule: Module = {
        id: moduleId,
        name: "Old Name",
        description: "Old Desc",
        unities: [],
      };
      const updatedModule: Module = { ...existingModule, ...updateModuleDto };

      mockModuleRepository.update.mockResolvedValue({ affected: 1 });
      mockModuleRepository.findOne.mockResolvedValue(updatedModule); // findOne is called after update

      const result = await service.update(moduleId, updateModuleDto);

      expect(result).toEqual(updatedModule);
      expect(mockModuleRepository.update).toHaveBeenCalledWith(
        moduleId,
        updateModuleDto
      );
      expect(mockModuleRepository.findOne).toHaveBeenCalledWith({
        where: { id: moduleId },
      });
    });

    it("should throw NotFoundException when module to update not found", async () => {
      const moduleId = "non-existent-id";
      const updateModuleDto: UpdateModuleDto = { name: "Updated Module" };
      mockModuleRepository.update.mockResolvedValue({ affected: 0 });

      await expect(service.update(moduleId, updateModuleDto)).rejects.toThrow(
        NotFoundException
      );
      expect(mockModuleRepository.update).toHaveBeenCalledWith(
        moduleId,
        updateModuleDto
      );
    });
  });

  describe("remove", () => {
    it("should remove a module", async () => {
      const moduleId = "test-id";
      mockModuleRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(moduleId);

      expect(mockModuleRepository.delete).toHaveBeenCalledWith(moduleId);
    });

    it("should throw NotFoundException when module to remove not found", async () => {
      const moduleId = "non-existent-id";
      mockModuleRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove(moduleId)).rejects.toThrow(NotFoundException);
      expect(mockModuleRepository.delete).toHaveBeenCalledWith(moduleId);
    });
  });

  describe("findUnitiesByModuleId", () => {
    it("should return a module with its unities", async () => {
      const moduleId = "test-id";
      const mockUnities: Unity[] = [
        { id: "u1", title: "Unity 1", moduleId: moduleId, module: null, lessons: [], description: null, order: 1, isLocked: false, requiredPoints: 0, isActive: true, user: null, userId: "some-user-id", topics: [], createdAt: new Date(), updatedAt: new Date() },
        { id: "u2", title: "Unity 2", moduleId: moduleId, module: null, lessons: [], description: null, order: 1, isLocked: false, requiredPoints: 0, isActive: true, user: null, userId: "some-user-id", topics: [], createdAt: new Date(), updatedAt: new Date() },
      ];
      const expectedModuleWithUnities: Module = {
        id: moduleId,
        name: "Test Module",
        description: "Description",
        unities: mockUnities,
      };
      mockModuleRepository.findOne.mockResolvedValue(
        expectedModuleWithUnities
      );

      const result = await service.findUnitiesByModuleId(moduleId);

      expect(result).toEqual(expectedModuleWithUnities);
      expect(mockModuleRepository.findOne).toHaveBeenCalledWith({
        where: { id: moduleId },
        relations: ["unities"],
      });
    });

    it("should return null if module not found", async () => {
      const moduleId = "non-existent-id";
      mockModuleRepository.findOne.mockResolvedValue(null);

      const result = await service.findUnitiesByModuleId(moduleId);

      expect(result).toBeNull();
      expect(mockModuleRepository.findOne).toHaveBeenCalledWith({
        where: { id: moduleId },
        relations: ["unities"],
      });
    });
  });
});
