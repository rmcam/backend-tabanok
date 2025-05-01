import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityService } from './activity.service';
import { Activity, ActivityType, DifficultyLevel } from './entities/activity.entity';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { NotFoundException } from '@nestjs/common';

const mockActivityRepository = () => ({
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
});

type MockType<T> = {
    [P in keyof T]?: jest.Mock<any, any>;
};

describe('ActivityService', () => {
    let service: ActivityService;
    let repository: MockType<Repository<Activity>>;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ActivityService,
                {
                    provide: getRepositoryToken(Activity),
                    useFactory: mockActivityRepository,
                },
            ],
        }).compile();

        service = module.get<ActivityService>(ActivityService);
        repository = module.get(getRepositoryToken(Activity));
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('should create an activity', async () => {
            const createActivityDto: CreateActivityDto = {
                title: 'Test Activity',
                description: 'Test Description',
                type: ActivityType.READING,
                difficulty: DifficultyLevel.BEGINNER,
                content: {},
                points: 100,
                isActive: true,
                metadata: {}
            };
            const mockActivity = { ...createActivityDto, id: 'test-id' };
            repository.create.mockReturnValue(mockActivity);
            repository.save.mockResolvedValue(mockActivity);

            const result = await service.create(createActivityDto);

            expect(repository.create).toHaveBeenCalledWith(createActivityDto);
            expect(repository.save).toHaveBeenCalledWith(mockActivity);
            expect(result).toEqual(mockActivity);
        });
    });

    describe('findAll', () => {
        it('should return all activities', async () => {
            const mockActivities = [{ id: 'test-id', title: 'Test Activity' }] as Activity[];
            repository.find.mockResolvedValue(mockActivities);

            const result = await service.findAll();

            expect(repository.find).toHaveBeenCalled();
            expect(result).toEqual(mockActivities);
        });
    });

    describe('findByType', () => {
        it('should return activities by type', async () => {
            const mockActivities = [{ id: 'test-id', title: 'Test Activity', type: ActivityType.READING }] as Activity[];
            repository.find.mockResolvedValue(mockActivities);

            const result = await service.findByType(ActivityType.READING);

            expect(repository.find).toHaveBeenCalledWith({ where: { type: ActivityType.READING } });
            expect(result).toEqual(mockActivities);
        });
    });

    describe('findByDifficulty', () => {
        it('should return activities by difficulty', async () => {
            const mockActivities = [{ id: 'test-id', title: 'Test Activity', difficulty: DifficultyLevel.BEGINNER }] as Activity[];
            repository.find.mockResolvedValue(mockActivities);

            const result = await service.findByDifficulty(DifficultyLevel.BEGINNER);

            expect(repository.find).toHaveBeenCalledWith({ where: { difficulty: DifficultyLevel.BEGINNER } });
            expect(result).toEqual(mockActivities);
        });
    });

    describe('findOne', () => {
        it('should return an activity by id', async () => {
            const mockActivity = { id: 'test-id', title: 'Test Activity' } as Activity;
            repository.findOne.mockResolvedValue(mockActivity);

            const result = await service.findOne('test-id');

            expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'test-id' } });
            expect(result).toEqual(mockActivity);
        });

        it('should throw NotFoundException if activity is not found', async () => {
            repository.findOne.mockResolvedValue(undefined);

            await expect(service.findOne('test-id')).rejects.toThrowError(NotFoundException);
            expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'test-id' } });
        });
    });

    describe('update', () => {
        it('should update an activity', async () => {
            const updateActivityDto: UpdateActivityDto = { title: 'Updated Test Activity' };
            const mockActivity = { id: 'test-id', title: 'Test Activity' } as Activity;
            const updatedActivity = { ...mockActivity, ...updateActivityDto };
            repository.findOne.mockResolvedValue(mockActivity);
            repository.save.mockResolvedValue(updatedActivity);

            const result = await service.update('test-id', updateActivityDto);

            expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'test-id' } });
            expect(repository.save).toHaveBeenCalledWith(updatedActivity);
            expect(result).toEqual(updatedActivity);
        });

        it('should throw NotFoundException if activity is not found', async () => {
            const updateActivityDto: UpdateActivityDto = { title: 'Updated Test Activity' };
            repository.findOne.mockResolvedValue(undefined);

            await expect(service.update('test-id', updateActivityDto)).rejects.toThrowError(NotFoundException);
            expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'test-id' } });
        });
    });

    describe('remove', () => {
        it('should remove an activity', async () => {
            const mockDeleteResult = { affected: 1 };
            repository.delete.mockResolvedValue(mockDeleteResult);

            await service.remove('test-id');

            expect(repository.delete).toHaveBeenCalledWith('test-id');
        });

        it('should throw NotFoundException if activity is not found', async () => {
            const mockDeleteResult = { affected: 0 };
            repository.delete.mockResolvedValue(mockDeleteResult);

            await expect(service.remove('test-id')).rejects.toThrowError(NotFoundException);
            expect(repository.delete).toHaveBeenCalledWith('test-id');
        });
    });

    describe('updatePoints', () => {
        it('should update the points of an activity', async () => {
            const mockActivity = { id: 'test-id', title: 'Test Activity', points: 100 } as Activity;
            repository.findOne.mockResolvedValue(mockActivity);
            repository.save.mockResolvedValue({ ...mockActivity, points: 200 });

            const result = await service.updatePoints('test-id', 200);

            expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'test-id' } });
            expect(repository.save).toHaveBeenCalledWith({ ...mockActivity, points: 200 });
            expect(result.points).toEqual(200);
        });

        it('should throw NotFoundException if activity is not found', async () => {
            repository.findOne.mockResolvedValue(undefined);

            await expect(service.updatePoints('test-id', 200)).rejects.toThrowError(NotFoundException);
            expect(repository.findOne).toHaveBeenCalledWith({ where: { id: 'test-id' } });
        });
    });
});
