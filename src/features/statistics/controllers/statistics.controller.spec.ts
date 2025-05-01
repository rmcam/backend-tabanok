import { Test, TestingModule } from "@nestjs/testing";
import { StatisticsService } from "../services/statistics.service";
import { StatisticsController } from "./statistics.controller";
import { JwtAuthGuard } from "../../../auth/guards/jwt-auth.guard"; // Corrected import path
import { CanActivate, ExecutionContext } from '@nestjs/common'; // Import necessary types

// Define a mock guard
class MockJwtAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    // Mock implementation: allow all requests
    return true;
  }
}

describe("StatisticsController", () => {
  let controller: StatisticsController;
  let service: any; // Use any type here as we are using useValue
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      controllers: [StatisticsController],
      providers: [
        {
          provide: StatisticsService,
          useValue: { // Use useValue
            create: jest.fn(),
            findAll: jest.fn(),
            findByUserId: jest.fn(),
            updateLearningProgress: jest.fn(),
            updateAchievementStats: jest.fn(),
            updateBadgeStats: jest.fn(),
            generateReport: jest.fn(),
            updateCategoryProgress: jest.fn(),
            getCategoryMetrics: jest.fn(),
            getLearningPath: jest.fn(),
            getAvailableCategories: jest.fn(),
            getNextMilestones: jest.fn(),
          },
        },
        {
          provide: JwtAuthGuard, // Provide the mock guard
          useClass: MockJwtAuthGuard,
        },
      ],
    }).compile();

    controller = module.get<StatisticsController>(StatisticsController);
    service = module.get<StatisticsService>(StatisticsService); // No need to cast to any or mock type
  });

  afterAll(async () => {
    await module.close();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a new statistics entry", async () => {
      const createStatisticsDto = {
        userId: "test" /* other properties */,
      } as any;
      const createdStatistics = {
        id: "1",
        userId: "test" /* other properties */,
      } as any;

      service.create.mockResolvedValue(createdStatistics);

      expect(await controller.create(createStatisticsDto)).toBe(
        createdStatistics
      );
      expect(service.create).toHaveBeenCalledWith(
        createStatisticsDto
      );
    });
  });

  describe("findAll", () => {
    it("should return all statistics entries", async () => {
      const statistics: any[] = [{ id: "1", userId: "test" } as any];
      service.findAll.mockResolvedValue(statistics);
      const result = await controller.findAll();
      expect(result).toBe(statistics);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe("findByUserId", () => {
    it("should return a statistics entry by userId", async () => {
      const userId = "test";
      const statistics = { id: "1", userId: "test" } as any;
      service.findByUserId.mockResolvedValue(statistics);
      const result = await controller.findByUserId(userId);
      expect(result).toBe(statistics);
      expect(service.findByUserId).toHaveBeenCalledWith(userId);
    });
  });

  describe("generateReport", () => {
    it("should generate a statistics report", async () => {
      const generateReportDto = {
        /* report properties */
      } as any;
      const report = {
        /* report data */
      };
      service.generateReport.mockResolvedValue(report);
      const result = await controller.generateReport(generateReportDto);
      expect(result).toBe(report);
      expect(service.generateReport).toHaveBeenCalledWith(
        generateReportDto
      );
    });
  });
});
