import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from '../lesson/entities/lesson.entity';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { Exercise, ExerciseType } from './entities/exercise.entity';

@Injectable()
export class ExerciseService {
    constructor(
        @InjectRepository(Exercise)
        private readonly exerciseRepository: Repository<Exercise>,
        @InjectRepository(Lesson)
        private readonly lessonRepository: Repository<Lesson>,
    ) { }

    async create(createExerciseDto: CreateExerciseDto): Promise<Exercise> {
        const lesson = await this.lessonRepository.findOneBy({
            id: createExerciseDto.lessonId,
        });

        if (!lesson) {
            throw new NotFoundException(
                `Lección con ID ${createExerciseDto.lessonId} no encontrada`,
            );
        }

        const exercise = new Exercise();
        Object.assign(exercise, createExerciseDto);

        // Si no se especifica un orden, obtener el último orden y agregar 1
        if (!exercise.order) {
            const maxOrder = await this.getMaxOrder(exercise.lessonId);
            exercise.order = maxOrder + 1;
        }

        return this.exerciseRepository.save(exercise);
    }

    async findAll(): Promise<Exercise[]> {
        return this.exerciseRepository.find({
            relations: ['lesson'],
            order: { order: 'ASC' },
        });
    }

    async findOne(id: string): Promise<Exercise> {
        const exercise = await this.exerciseRepository.findOne({
            where: { id },
            relations: ['lesson'],
        });

        if (!exercise) {
            throw new NotFoundException(`Ejercicio con ID ${id} no encontrado`);
        }

        return exercise;
    }

    async findByLesson(lessonId: string): Promise<Exercise[]> {
        return this.exerciseRepository.find({
            where: { lessonId },
            order: { order: 'ASC' },
        });
    }

    async findByType(type: ExerciseType): Promise<Exercise[]> {
        return this.exerciseRepository.find({
            where: { type },
            relations: ['lesson'],
            order: { order: 'ASC' },
        });
    }

    async update(id: string, updateExerciseDto: UpdateExerciseDto): Promise<Exercise> {
        const exercise = await this.findOne(id);

        if (updateExerciseDto.lessonId) {
            const lesson = await this.lessonRepository.findOneBy({
                id: updateExerciseDto.lessonId,
            });

            if (!lesson) {
                throw new NotFoundException(
                    `Lección con ID ${updateExerciseDto.lessonId} no encontrada`,
                );
            }
        }

        Object.assign(exercise, updateExerciseDto);
        return this.exerciseRepository.save(exercise);
    }

    async remove(id: string): Promise<void> {
        const exercise = await this.findOne(id);
        await this.exerciseRepository.remove(exercise);
    }

    async reorderExercises(lessonId: string): Promise<void> {
        const exercises = await this.findByLesson(lessonId);
        for (let i = 0; i < exercises.length; i++) {
            exercises[i].order = i + 1;
            await this.exerciseRepository.save(exercises[i]);
        }
    }

    async toggleActive(id: string): Promise<Exercise> {
        const exercise = await this.findOne(id);
        exercise.isActive = !exercise.isActive;
        return this.exerciseRepository.save(exercise);
    }

    async updatePoints(id: string, points: number): Promise<Exercise> {
        const exercise = await this.findOne(id);
        exercise.points = points;
        return this.exerciseRepository.save(exercise);
    }

    async updateStatistics(
        id: string,
        completionTime: number,
        success: boolean,
    ): Promise<Exercise> {
        const exercise = await this.findOne(id);

        // Actualizar intentos
        exercise.attempts += 1;

        // Actualizar tasa de éxito
        const oldSuccessCount = exercise.successRate * (exercise.attempts - 1);
        const newSuccessCount = oldSuccessCount + (success ? 1 : 0);
        exercise.successRate = newSuccessCount / exercise.attempts;

        // Actualizar tiempo promedio de completado
        const oldTotalTime = exercise.averageCompletionTime * (exercise.attempts - 1);
        exercise.averageCompletionTime = (oldTotalTime + completionTime) / exercise.attempts;

        return this.exerciseRepository.save(exercise);
    }

    private async getMaxOrder(lessonId: string): Promise<number> {
        const result = await this.exerciseRepository
            .createQueryBuilder('exercise')
            .where('exercise.lessonId = :lessonId', { lessonId })
            .select('MAX(exercise.order)', 'maxOrder')
            .getRawOne();

        return result.maxOrder || 0;
    }
} 