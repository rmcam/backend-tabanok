import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { UserLevelController } from "@/features/gamification/controllers/user-level.controller"; // Usar ruta absoluta
import { UpdateUserLevelDto } from "@/features/gamification/dto/update-user-level.dto"; // Usar ruta absoluta
import { GamificationService } from "@/features/gamification/services/gamification.service"; // Usar ruta absoluta
import { NotFoundException, BadRequestException } from "@nestjs/common"; // Importar BadRequestException
import { Test, TestingModule } from "@nestjs/testing";

describe("UserLevelController", () => {
  let controller: UserLevelController;
  let service: GamificationService; // Cambiado a GamificationService

  const mockGamificationService = {
    // Cambiado a mockGamificationService
    getUserStats: jest.fn(), // Cambiado a getUserStats
    updateStats: jest.fn(), // Cambiado a updateStats
    addPoints: jest.fn(), // Cambiado a addPoints
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserLevelController],
      providers: [
        {
          provide: GamificationService, // Cambiado a GamificationService
          useValue: mockGamificationService, // Cambiado a mockGamificationService
        },
      ],
    })
      .overrideGuard(JwtAuthGuard) // Sobrescribir el guard JWT
      .useValue({ canActivate: () => true }) // Permitir siempre el acceso para pruebas de controlador
      // Si RolesGuard se usa en el controlador, también debe sobrescribirse aquí
      // .overrideGuard(RolesGuard)
      // .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UserLevelController>(UserLevelController);
    service = module.get<GamificationService>(GamificationService); // Cambiado a GamificationService

    jest.clearAllMocks();
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("getUserLevel", () => {
    // Corresponde a getUserStats en el servicio
    it("should return user level for a user", async () => {
      const userId = "test-user-id";
      const expectedUserStats: any = {
        // Cambiado a expectedUserStats
        level: 1,
        experience: 0,
        // ... otras propiedades de estadísticas
      };

      mockGamificationService.getUserStats.mockResolvedValue(expectedUserStats); // Cambiado a mockGamificationService.getUserStats

      const result = await controller.getUserLevel(userId);

      expect(result).toEqual(expectedUserStats);
      expect(mockGamificationService.getUserStats).toHaveBeenCalledWith(userId); // Cambiado a mockGamificationService.getUserStats
    });

    it("should throw NotFoundException if user level not found", async () => {
      const userId = "non-existent-user";

      mockGamificationService.getUserStats.mockRejectedValue(
        new NotFoundException()
      ); // Cambiado a mockGamificationService.getUserStats

      await expect(controller.getUserLevel(userId)).rejects.toThrow(
        NotFoundException
      );
      expect(mockGamificationService.getUserStats).toHaveBeenCalledWith(userId); // Cambiado a mockGamificationService.getUserStats
    });
  });

  describe("updateUserLevel", () => {
    // Corresponde a updateStats en el servicio
    it("should update user level", async () => {
      const userId = "test-user-id";
      const updateUserLevelDto: UpdateUserLevelDto = {
        currentLevel: 5,
        experiencePoints: 500,
      };
      const expectedUpdatedStats: any = {
        // Cambiado a expectedUpdatedStats
        level: 5,
        experience: 500,
        // ... otras propiedades de estadísticas actualizadas
      };

      mockGamificationService.updateStats.mockResolvedValue(
        expectedUpdatedStats
      ); // Cambiado a mockGamificationService.updateStats

      const result = await controller.updateUserLevel(
        userId,
        updateUserLevelDto
      );

      expect(result).toEqual(expectedUpdatedStats);
      expect(mockGamificationService.updateStats).toHaveBeenCalledWith(
        // Cambiado a mockGamificationService.updateStats
        userId,
        updateUserLevelDto
      );
    });

    it("should throw NotFoundException if user level not found", async () => {
      const userId = "non-existent-user";
      const updateUserLevelDto: UpdateUserLevelDto = { currentLevel: 5 };

      mockGamificationService.updateStats.mockRejectedValue(
        // Cambiado a mockGamificationService.updateStats
        new NotFoundException()
      );

      await expect(
        controller.updateUserLevel(userId, updateUserLevelDto)
      ).rejects.toThrow(NotFoundException);
      expect(mockGamificationService.updateStats).toHaveBeenCalledWith(
        // Cambiado a mockGamificationService.updateStats
        userId,
        updateUserLevelDto
      );
    });

    // Nueva prueba para manejar BadRequestException
    it("should throw BadRequestException for invalid update data", async () => {
      const userId = "test-user-id";
      const updateUserLevelDto: UpdateUserLevelDto = {
        currentLevel: -1, // Valor inválido
        experiencePoints: 500,
      };

      mockGamificationService.updateStats.mockRejectedValue(
        // Cambiado a mockGamificationService.updateStats
        new BadRequestException("Invalid update data")
      );

      await expect(
        controller.updateUserLevel(userId, updateUserLevelDto)
      ).rejects.toThrow(BadRequestException);
      expect(mockGamificationService.updateStats).toHaveBeenCalledWith(
        // Cambiado a mockGamificationService.updateStats
        userId,
        updateUserLevelDto
      );
    });
  });

  describe("addXp", () => {
    // Corresponde a addPoints en el servicio
    it("should add experience points to a user", async () => {
      const userId = "test-user-id";
      const xpToAdd = 100;
      const expectedUpdatedStats: any = {
        // Cambiado a expectedUpdatedStats
        level: 1,
        experience: 100,
        // ... otras propiedades de estadísticas actualizadas
      };

      mockGamificationService.addPoints.mockResolvedValue(expectedUpdatedStats); // Cambiado a mockGamificationService.addPoints

      const result = await controller.addXp(userId, xpToAdd);

      expect(result).toEqual(expectedUpdatedStats);
      expect(mockGamificationService.addPoints).toHaveBeenCalledWith(
        // Cambiado a mockGamificationService.addPoints
        userId,
        xpToAdd
      );
    });

    it("should throw NotFoundException if user level not found", async () => {
      const userId = "non-existent-user";
      const xpToAdd = 100;

      mockGamificationService.addPoints.mockRejectedValue(
        // Cambiado a mockGamificationService.addPoints
        new NotFoundException()
      );

      await expect(controller.addXp(userId, xpToAdd)).rejects.toThrow(
        NotFoundException
      );
      expect(mockGamificationService.addPoints).toHaveBeenCalledWith(
        // Cambiado a mockGamificationService.addPoints
        userId,
        xpToAdd
      );
    });

    // Nueva prueba para manejar BadRequestException (por ejemplo, XP negativo)
    it("should throw BadRequestException for negative xp", async () => {
      const userId = "test-user-id";
      const xpToAdd = -100; // Valor inválido

      mockGamificationService.addPoints.mockRejectedValue(
        // Cambiado a mockGamificationService.addPoints
        new BadRequestException("XP cannot be negative")
      );

      await expect(controller.addXp(userId, xpToAdd)).rejects.toThrow(
        BadRequestException
      );
      expect(mockGamificationService.addPoints).toHaveBeenCalledWith(
        // Cambiado a mockGamificationService.addPoints
        userId,
        xpToAdd
      );
    });
  });
});

type MockType<T> = {
  [P in keyof T]?: jest.Mock<any, any>;
};
