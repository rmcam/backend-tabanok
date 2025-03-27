import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { Exercise } from './entities/exercise.entity';

@Injectable()
export class ExerciseService {
    constructor(
        @InjectRepository(Exercise)
        private readonly exerciseRepository: Repository<Exercise>,
    ) { }

    async create(createExerciseDto: CreateExerciseDto): Promise<Exercise> {
        const exercise = this.exerciseRepository.create(createExerciseDto);
        return await this.exerciseRepository.save(exercise);
    }

    async findAll(): Promise<Exercise[]> {
        return await this.exerciseRepository.find({
            where: { isActive: true },
            order: { order: 'ASC' },
        });
    }

    async findOne(id: string): Promise<Exercise> {
        const exercise = await this.exerciseRepository.findOne({
            where: { id, isActive: true },
        });

        if (!exercise) {
            throw new NotFoundException(`Exercise with ID ${id} not found`);
        }

        return exercise;
    }

    async update(id: string, updateExerciseDto: UpdateExerciseDto): Promise<Exercise> {
        const exercise = await this.findOne(id);
        Object.assign(exercise, updateExerciseDto);
        return await this.exerciseRepository.save(exercise);
    }

    async remove(id: string): Promise<void> {
        const exercise = await this.findOne(id);
        exercise.isActive = false;
        await this.exerciseRepository.save(exercise);
    }
} 