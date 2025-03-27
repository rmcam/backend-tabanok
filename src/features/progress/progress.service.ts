import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { Progress } from './entities/progress.entity';

@Injectable()
export class ProgressService {
    constructor(
        @InjectRepository(Progress)
        private readonly progressRepository: Repository<Progress>,
    ) { }

    async create(createProgressDto: CreateProgressDto): Promise<Progress> {
        const progress = this.progressRepository.create(createProgressDto);
        return await this.progressRepository.save(progress);
    }

    async findAll(): Promise<Progress[]> {
        return await this.progressRepository.find({
            where: { isActive: true },
            relations: ['user', 'exercise'],
        });
    }

    async findOne(id: string): Promise<Progress> {
        const progress = await this.progressRepository.findOne({
            where: { id, isActive: true },
            relations: ['user', 'exercise'],
        });

        if (!progress) {
            throw new NotFoundException(`Progress with ID ${id} not found`);
        }

        return progress;
    }

    async findByUser(userId: string): Promise<Progress[]> {
        return await this.progressRepository.find({
            where: { user: { id: userId }, isActive: true },
            relations: ['exercise'],
        });
    }

    async findByExercise(exerciseId: string): Promise<Progress[]> {
        return await this.progressRepository.find({
            where: { exercise: { id: exerciseId }, isActive: true },
            relations: ['user'],
        });
    }

    async update(id: string, updateProgressDto: UpdateProgressDto): Promise<Progress> {
        const progress = await this.findOne(id);
        Object.assign(progress, updateProgressDto);
        return await this.progressRepository.save(progress);
    }

    async remove(id: string): Promise<void> {
        const progress = await this.findOne(id);
        progress.isActive = false;
        await this.progressRepository.save(progress);
    }

    async updateScore(id: string, score: number): Promise<Progress> {
        const progress = await this.findOne(id);
        progress.score = score;
        return await this.progressRepository.save(progress);
    }

    async completeExercise(id: string, answers: Record<string, any>): Promise<Progress> {
        const progress = await this.findOne(id);
        progress.isCompleted = true;
        progress.answers = answers;
        return await this.progressRepository.save(progress);
    }
} 