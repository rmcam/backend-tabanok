import { Test, TestingModule } from '@nestjs/testing';
import { BaseRewardService } from './base-reward.service';
import { User } from '../../../../auth/entities/user.entity';
import { CulturalAchievement } from '../../entities/cultural-achievement.entity';

// Clase de prueba concreta que extiende la clase abstracta
class ConcreteRewardService extends BaseRewardService {
  async calculateReward(
    user: User,
    action: string,
    metadata?: any,
  ): Promise<CulturalAchievement> {
    // Implementación mínima para la prueba
    return {} as CulturalAchievement;
  }

  async validateRequirements(user: User, achievement: CulturalAchievement): Promise<boolean> {
    // Implementación mínima para la prueba
    return true;
  }

  // Exponer métodos protegidos para pruebas
  public exposeUpdateUserStats(user: User, achievement: CulturalAchievement): Promise<void> {
    return this.updateUserStats(user, achievement);
  }

  public exposeGetRewardExpiration(achievement: CulturalAchievement): Date | null {
    return this.getRewardExpiration(achievement);
  }

  public exposeValidateRewardCriteria(user: User, requirements: any): boolean {
    return this.validateRewardCriteria(user, requirements);
  }
}

describe('BaseRewardService', () => {
  let service: ConcreteRewardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        // Proporcionar la clase concreta en lugar de la abstracta
        ConcreteRewardService,
      ],
    }).compile();

    service = module.get<ConcreteRewardService>(ConcreteRewardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getRewardExpiration', () => {
    it('should return null if expirationDays is not set or is 0', () => {
      const achievementWithoutExpiration = { expirationDays: 0 } as CulturalAchievement;
      const achievementWithNullExpiration = {} as CulturalAchievement;

      expect(service.exposeGetRewardExpiration(achievementWithoutExpiration)).toBeNull();
      expect(service.exposeGetRewardExpiration(achievementWithNullExpiration)).toBeNull();
    });

    it('should return a date in the future if expirationDays is set', () => {
      const achievementWithExpiration = { expirationDays: 7 } as CulturalAchievement;
      const expirationDate = service.exposeGetRewardExpiration(achievementWithExpiration);

      expect(expirationDate).not.toBeNull();
      expect(expirationDate?.getTime()).toBeGreaterThan(new Date().getTime());
    });
  });

  describe('updateUserStats', () => {
    it('should update user culturalPoints based on achievement pointsReward', async () => {
      const user = { culturalPoints: 10 } as User;
      const achievement = { pointsReward: 5 } as CulturalAchievement;

      await service.exposeUpdateUserStats(user, achievement);

      expect(user.culturalPoints).toBe(15);
    });

    it('should not change user culturalPoints if pointsReward is not set or is 0', async () => {
      const user = { culturalPoints: 10 } as User;
      const achievementWithoutReward = { pointsReward: 0 } as CulturalAchievement;
      const achievementWithNullReward = {} as CulturalAchievement;

      await service.exposeUpdateUserStats(user, achievementWithoutReward);
      expect(user.culturalPoints).toBe(10);

      await service.exposeUpdateUserStats(user, achievementWithNullReward);
      expect(user.culturalPoints).toBe(10);
    });
  });

  describe('validateRewardCriteria', () => {
    let user: User;

    beforeEach(() => {
      user = { level: 5, userAchievements: [{ achievementId: 1 }, { achievementId: 2 }] } as unknown as User;
    });

    it('should return true if no requirements are provided', () => {
      expect(service.exposeValidateRewardCriteria(user, null)).toBe(true);
      expect(service.exposeValidateRewardCriteria(user, {})).toBe(true);
    });

    it('should return false if user level is below minLevel', () => {
      const requirements = { minLevel: 6 };
      expect(service.exposeValidateRewardCriteria(user, requirements)).toBe(false);
    });

    it('should return true if user level is equal to or above minLevel', () => {
      const requirements = { minLevel: 5 };
      expect(service.exposeValidateRewardCriteria(user, requirements)).toBe(true);

      const requirementsAbove = { minLevel: 4 };
      expect(service.exposeValidateRewardCriteria(user, requirementsAbove)).toBe(true);
    });

    it('should return false if user is missing required achievements', () => {
      const requirements = { requiredAchievements: [1, 3] };
      expect(service.exposeValidateRewardCriteria(user, requirements)).toBe(false);
    });

    it('should return true if user has all required achievements', () => {
      const requirements = { requiredAchievements: [1, 2] };
      expect(service.exposeValidateRewardCriteria(user, requirements)).toBe(true);
    });

    it('should return true if requiredAchievements is an empty array', () => {
      const requirements = { requiredAchievements: [] };
      expect(service.exposeValidateRewardCriteria(user, requirements)).toBe(true);
    });

    it('should return false if both minLevel and requiredAchievements criteria are not met', () => {
      const requirements = { minLevel: 6, requiredAchievements: [1, 3] };
      expect(service.exposeValidateRewardCriteria(user, requirements)).toBe(false);
    });

    it('should return false if minLevel is not met but requiredAchievements are met', () => {
      const requirements = { minLevel: 6, requiredAchievements: [1, 2] };
      expect(service.exposeValidateRewardCriteria(user, requirements)).toBe(false);
    });

    it('should return false if requiredAchievements are not met but minLevel is met', () => {
      const requirements = { minLevel: 5, requiredAchievements: [1, 3] };
      expect(service.exposeValidateRewardCriteria(user, requirements)).toBe(false);
    });

    it('should return true if both minLevel and requiredAchievements criteria are met', () => {
      const requirements = { minLevel: 5, requiredAchievements: [1, 2] };
      expect(service.exposeValidateRewardCriteria(user, requirements)).toBe(true);
    });
  });
});
