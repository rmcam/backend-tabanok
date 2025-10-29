import { Injectable, NotFoundException } from '@nestjs/common';
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
        return this.exercisesRepository.findOneOrFail({
            where: { id },
        });
    }

    async update(id: string, updateExerciseDto: UpdateExerciseDto): Promise<Exercise> {
        await this.exercisesRepository.update(id, updateExerciseDto);
        return this.findOne(id);
    }

    async remove(id: string): Promise<void> {
        await this.exercisesRepository.delete(id);
    }

    async findByTopic(topicId: string): Promise<Exercise[]> {
        return await this.exercisesRepository.find({
            where: { topicId, isActive: true },
            order: { difficulty: 'ASC', createdAt: 'DESC' }
        });
    }

    async findAllByLesson(lessonId: string): Promise<Exercise[]> {
        return await this.exercisesRepository.find({
            where: { lessonId, isActive: true },
            order: { difficulty: 'ASC', createdAt: 'DESC' }
        });
    }

    async updateStats(id: string, score: number): Promise<void> {
        const exercise = await this.exercisesRepository.findOne({ where: { id }, select: ['timesCompleted', 'averageScore'] });

        if (!exercise) {
            // Considerar si lanzar una excepción o simplemente no hacer nada si el ejercicio no se encuentra
            // Por ahora, lanzaremos una excepción para mantener la consistencia con findOneOrFail
            throw new NotFoundException(`Exercise with ID ${id} not found`);
        }

        const newTimesCompleted = exercise.timesCompleted + 1;
        const newAverageScore = (exercise.averageScore * exercise.timesCompleted + score) / newTimesCompleted;

        await this.exercisesRepository.update(id, {
            timesCompleted: newTimesCompleted,
            averageScore: newAverageScore,
        });
    }

}
