import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';
import { Activity, ActivityType, DifficultyLevel } from './entities/activity.entity';

@Injectable()
export class ActivityService {
    constructor(
        @InjectRepository(Activity)
        private readonly activityRepository: Repository<Activity>,
    ) { }

    async create(createActivityDto: CreateActivityDto): Promise<Activity> {
        const activity = this.activityRepository.create(createActivityDto);
        return await this.activityRepository.save(activity);
    }

    async findAll(): Promise<Activity[]> {
        return await this.activityRepository.find({
            where: { isActive: true },
        });
    }

    async findByType(type: ActivityType): Promise<Activity[]> {
        return await this.activityRepository.find({
            where: { type, isActive: true },
        });
    }

    async findByDifficulty(difficulty: DifficultyLevel): Promise<Activity[]> {
        return await this.activityRepository.find({
            where: { difficulty, isActive: true },
        });
    }

    async findOne(id: string): Promise<Activity> {
        const activity = await this.activityRepository.findOne({
            where: { id, isActive: true },
        });

        if (!activity) {
            throw new NotFoundException(`Activity with ID ${id} not found`);
        }

        return activity;
    }

    async update(id: string, updateActivityDto: UpdateActivityDto): Promise<Activity> {
        const activity = await this.findOne(id);
        Object.assign(activity, updateActivityDto);
        return await this.activityRepository.save(activity);
    }

    async remove(id: string): Promise<void> {
        const activity = await this.findOne(id);
        activity.isActive = false;
        await this.activityRepository.save(activity);
    }

    async updatePoints(id: string, points: number): Promise<Activity> {
        const activity = await this.findOne(id);
        activity.points = points;
        return await this.activityRepository.save(activity);
    }
} 