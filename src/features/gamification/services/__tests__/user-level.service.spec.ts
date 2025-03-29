import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../../auth/entities/user.entity';
import { NotificationService } from '../../../notifications/services/notification.service';
import { UserLevel } from '../../entities/user-level.entity';
import { UserLevelService } from '../user-level.service';

describe('UserLevelService', () => {
    let service: UserLevelService;
    let userLevelRepository: Repository<UserLevel>;
    let userRepository: Repository<User>;
    let notificationService: NotificationService;

    const mockUser = {
        id: '1',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User'
    };

    const mockUserLevel = {
        id: '1',
        user: mockUser,
        currentLevel: 1,
        experiencePoints: 0,
        levelHistory: [],
        consistencyStreak: {
            current: 0,
            longest: 0,
            lastActivityDate: new Date(),
            streakHistory: []
        },
        achievements: [],
        milestones: [],
        createdAt: new Date(),
        updatedAt: new Date()
    } as UserLevel;

    const mockLevelUpUserLevel = {
        ...mockUserLevel,
        experiencePoints: 500,
        currentLevel: 2,
        levelHistory: [{
            level: 1,
            achievedAt: new Date(),
            bonusesReceived: []
        }]
    } as UserLevel;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserLevelService,
                {
                    provide: getRepositoryToken(UserLevel),
                    useValue: {
                        findOne: jest.fn().mockResolvedValue(mockUserLevel),
                        save: jest.fn().mockImplementation(entity => Promise.resolve(entity))
                    }
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        findOne: jest.fn().mockResolvedValue(mockUser)
                    }
                },
                {
                    provide: NotificationService,
                    useValue: {
                        notifyLevelUp: jest.fn().mockResolvedValue(undefined),
                        createNotification: jest.fn().mockResolvedValue(undefined)
                    }
                }
            ]
        }).compile();

        service = module.get<UserLevelService>(UserLevelService);
        userLevelRepository = module.get<Repository<UserLevel>>(getRepositoryToken(UserLevel));
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
        notificationService = module.get<NotificationService>(NotificationService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('addExperiencePoints', () => {
        it('should add experience points without level up', async () => {
            const userId = '1';
            const points = 50;

            const result = await service.addExperiencePoints(userId, points);

            expect(result.experiencePoints).toBe(50);
            expect(result.currentLevel).toBe(1);
            expect(notificationService.notifyLevelUp).not.toHaveBeenCalled();
        });

        it('should level up when enough experience points are added', async () => {
            const userId = '1';
            const points = 500;

            jest.spyOn(userLevelRepository, 'save')
                .mockResolvedValue(mockLevelUpUserLevel);

            const result = await service.addExperiencePoints(userId, points);

            expect(result.experiencePoints).toBe(500);
            expect(result.currentLevel).toBe(2);
            expect(notificationService.notifyLevelUp).toHaveBeenCalledWith(userId, 2);
        });

        it('should throw NotFoundException when user level not found', async () => {
            jest.spyOn(userLevelRepository, 'findOne').mockResolvedValue(null);

            await expect(service.addExperiencePoints('999', 100))
                .rejects
                .toThrow(NotFoundException);
        });
    });
}); 