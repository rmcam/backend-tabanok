import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../../../../auth/entities/user.entity';
import { AchievementProgress } from '../../entities/achievement-progress.entity';
import { AchievementCategory, AchievementTier, CulturalAchievement } from '../../entities/cultural-achievement.entity';
import { CulturalAchievementService } from '../cultural-achievement.service';

describe('CulturalAchievementService', () => {
    let service: CulturalAchievementService;
    let achievementRepository: Repository<CulturalAchievement>;
    let progressRepository: Repository<AchievementProgress>;
    let userRepository: Repository<User>;

    const mockUser = {
        id: '1',
        email: 'test@example.com',
        password: 'hashedPassword123',
        firstName: 'Juan',
        lastName: 'Pérez',
        role: UserRole.USER,
        culturalPoints: 0,
        achievements: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        lastLoginAt: new Date()
    } as User;

    const mockAchievement = {
        id: '1',
        name: 'Danzador Experto',
        description: 'Domina las danzas tradicionales',
        category: AchievementCategory.DANZA,
        tier: AchievementTier.ORO,
        requirements: [
            {
                type: 'danza_sessions',
                value: 10,
                description: 'Completa 10 sesiones de danza'
            }
        ],
        pointsReward: 100,
        isActive: true,
        isSecret: false,
        users: [],
        createdAt: new Date(),
        updatedAt: new Date()
    } as CulturalAchievement;

    const mockProgress = {
        id: '1',
        user: mockUser,
        achievement: mockAchievement,
        progress: [
            {
                requirementType: 'danza_sessions',
                currentValue: 0,
                targetValue: 10,
                lastUpdated: new Date()
            }
        ],
        milestones: [
            {
                description: 'Alcanzar nivel principiante en danza',
                value: 25,
                isAchieved: false
            },
            {
                description: 'Alcanzar nivel intermedio en danza',
                value: 50,
                isAchieved: false
            },
            {
                description: 'Alcanzar nivel avanzado en danza',
                value: 75,
                isAchieved: false
            }
        ],
        percentageCompleted: 0,
        isCompleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
    } as AchievementProgress;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CulturalAchievementService,
                {
                    provide: getRepositoryToken(CulturalAchievement),
                    useValue: {
                        create: jest.fn().mockReturnValue(mockAchievement),
                        save: jest.fn().mockResolvedValue(mockAchievement),
                        findOne: jest.fn().mockResolvedValue(mockAchievement),
                        createQueryBuilder: jest.fn(() => ({
                            where: jest.fn().mockReturnThis(),
                            andWhere: jest.fn().mockReturnThis(),
                            getMany: jest.fn().mockResolvedValue([mockAchievement])
                        }))
                    }
                },
                {
                    provide: getRepositoryToken(AchievementProgress),
                    useValue: {
                        create: jest.fn().mockReturnValue(mockProgress),
                        save: jest.fn().mockResolvedValue(mockProgress),
                        findOne: jest.fn().mockResolvedValue(mockProgress),
                        find: jest.fn().mockResolvedValue([mockProgress])
                    }
                },
                {
                    provide: getRepositoryToken(User),
                    useValue: {
                        findOne: jest.fn().mockResolvedValue(mockUser),
                        save: jest.fn().mockResolvedValue(mockUser)
                    }
                }
            ]
        }).compile();

        service = module.get<CulturalAchievementService>(CulturalAchievementService);
        achievementRepository = module.get<Repository<CulturalAchievement>>(getRepositoryToken(CulturalAchievement));
        progressRepository = module.get<Repository<AchievementProgress>>(getRepositoryToken(AchievementProgress));
        userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('createAchievement', () => {
        it('should create a new achievement', async () => {
            const achievementData = {
                name: 'Danzador Experto',
                description: 'Domina las danzas tradicionales',
                category: AchievementCategory.DANZA,
                tier: AchievementTier.ORO,
                requirements: [
                    {
                        type: 'danza_sessions',
                        value: 10,
                        description: 'Completa 10 sesiones de danza'
                    }
                ],
                pointsReward: 100
            };

            const result = await service.createAchievement(achievementData);
            expect(result).toEqual(mockAchievement);
            expect(achievementRepository.create).toHaveBeenCalledWith(achievementData);
            expect(achievementRepository.save).toHaveBeenCalled();
        });
    });

    describe('getAchievements', () => {
        it('should return all active achievements when no category is provided', async () => {
            const result = await service.getAchievements();
            expect(result).toEqual([mockAchievement]);
        });

        it('should return achievements filtered by category', async () => {
            const result = await service.getAchievements(AchievementCategory.DANZA);
            expect(result).toEqual([mockAchievement]);
        });
    });

    describe('initializeUserProgress', () => {
        it('should initialize progress for a user and achievement', async () => {
            jest.spyOn(progressRepository, 'findOne').mockResolvedValue(null);
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(mockUser);
            jest.spyOn(achievementRepository, 'findOne').mockResolvedValue(mockAchievement);

            const result = await service.initializeUserProgress('1', '1');
            expect(result).toEqual(mockProgress);
            expect(progressRepository.create).toHaveBeenCalled();
            expect(progressRepository.save).toHaveBeenCalled();
        });

        it('should throw NotFoundException when user is not found', async () => {
            jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);
            await expect(service.initializeUserProgress('999', '1')).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException when progress already exists', async () => {
            jest.spyOn(progressRepository, 'findOne').mockResolvedValue(mockProgress);
            await expect(service.initializeUserProgress('1', '1')).rejects.toThrow(BadRequestException);
        });
    });

    describe('updateProgress', () => {
        it('should update progress correctly', async () => {
            const updates = [
                { type: 'danza_sessions', value: 5 }
            ];

            const result = await service.updateProgress('1', '1', updates);
            expect(result).toBeDefined();
            expect(progressRepository.save).toHaveBeenCalled();
        });

        it('should throw NotFoundException when progress is not found', async () => {
            jest.spyOn(progressRepository, 'findOne').mockResolvedValue(null);
            await expect(service.updateProgress('1', '1', [])).rejects.toThrow(NotFoundException);
        });

        it('should throw BadRequestException when achievement is already completed', async () => {
            jest.spyOn(progressRepository, 'findOne').mockResolvedValue({
                ...mockProgress,
                isCompleted: true
            } as AchievementProgress);
            await expect(service.updateProgress('1', '1', [])).rejects.toThrow(BadRequestException);
        });
    });

    describe('getUserAchievements', () => {
        it('should return user achievements separated by completion status', async () => {
            const result = await service.getUserAchievements('1');
            expect(result).toHaveProperty('completed');
            expect(result).toHaveProperty('inProgress');
        });
    });

    describe('getAchievementProgress', () => {
        it('should return progress for specific achievement', async () => {
            const result = await service.getAchievementProgress('1', '1');
            expect(result).toEqual(mockProgress);
        });

        it('should throw NotFoundException when progress is not found', async () => {
            jest.spyOn(progressRepository, 'findOne').mockResolvedValue(null);
            await expect(service.getAchievementProgress('1', '1')).rejects.toThrow(NotFoundException);
        });
    });
}); 