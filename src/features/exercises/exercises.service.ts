import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { Exercise } from './entities/exercise.entity';

@Injectable()
export class ExercisesService {
    constructor(
        @InjectRepository(Exercise)
        private exercisesRepository: Repository<Exercise>
    ) { }

    async create(createExerciseDto: CreateExerciseDto): Promise<Exercise> {
        const exercise = this.exercisesRepository.create(createExerciseDto);
        return this.exercisesRepository.save(exercise);
    }

    async findAll(): Promise<Exercise[]> {
        return this.exercisesRepository.find();
    }

    async findOne(id: string): Promise<Exercise> {
        return this.exercisesRepository.findOneOrFail({ where: { id } });
    }

    async update(id: string, updateExerciseDto: UpdateExerciseDto): Promise<Exercise> {
        await this.exercisesRepository.update(id, updateExerciseDto);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.exercisesRepository.delete(id);
    }

    async updateStats(id: string, score: number): Promise<void> {
        const exercise = await this.findOne(id);

        exercise.timesCompleted += 1;
        exercise.averageScore = (exercise.averageScore * (exercise.timesCompleted - 1) + score) / exercise.timesCompleted;

        await this.exercisesRepository.save(exercise);
    }
}
