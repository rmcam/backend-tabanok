import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { Progress } from './entities/progress.entity';
import { UserModuleProgressService } from './user-module-progress.service';
import { Exercise } from '../exercises/entities/exercise.entity';
import { ExercisesService } from '../exercises/exercises.service'; // Importar ExercisesService
@Injectable()
export class ProgressService {
    constructor(
        @InjectRepository(Progress)
        private readonly progressRepository: Repository<Progress>,
        @InjectRepository(Exercise)
        private readonly exerciseRepository: Repository<Exercise>,
        private readonly userModuleProgressService: UserModuleProgressService,
        private readonly exercisesService: ExercisesService, // Inyectar ExercisesService
        private dataSource: DataSource,
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
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const progress = await queryRunner.manager.findOne(Progress, { where: { id, isActive: true } });

            if (!progress) {
                throw new NotFoundException(`Progress with ID ${id} not found`);
            }

            progress.score = score;

            await queryRunner.manager.save(progress);

            // Aquí se podrían añadir otras operaciones de base de datos
            // que necesiten ser parte de la misma transacción.

            await queryRunner.commitTransaction();
            return progress;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async completeExercise(id: string, answers: Record<string, any>): Promise<Progress> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const progress = await queryRunner.manager.findOne(Progress, {
                where: { id, isActive: true },
                relations: ['user', 'exercise'],
            });

            if (!progress) {
                throw new NotFoundException(`Progress with ID ${id} not found`);
            }

            progress.answers = answers;

            // Obtener el ejercicio completo para acceder a las respuestas correctas
            const exercise = await queryRunner.manager.findOne(Exercise, {
                where: { id: progress.exercise.id },
                relations: ['lesson', 'lesson.unity', 'lesson.unity.module'],
            });

            if (!exercise) {
                throw new NotFoundException(`Exercise with ID ${progress.exercise.id} not found`);
            }

            // Lógica para calcular el score
            let calculatedScore = 0;
            if (exercise.content && exercise.content.correctAnswers) {
                // Suponemos que exercise.content.correctAnswers es un objeto o array
                // y que answers es un objeto o array con las respuestas del usuario.
                // Esta es una implementación básica y puede necesitar ser más sofisticada
                // dependiendo de la complejidad de los tipos de ejercicios.
                const correctAnswers = exercise.content.correctAnswers;
                const userAnswers = answers;

                // Ejemplo simple: comparar respuestas clave por clave
                let correctCount = 0;
                let totalQuestions = 0;

                if (typeof correctAnswers === 'object' && correctAnswers !== null) {
                    totalQuestions = Object.keys(correctAnswers).length;
                    for (const key in correctAnswers) {
                        if (userAnswers.hasOwnProperty(key) && userAnswers[key] === correctAnswers[key]) {
                            correctCount++;
                        }
                    }
                } else {
                    // Si el formato de correctAnswers no es el esperado, lanzar un error o manejarlo
                    throw new BadRequestException('Exercise content does not have a valid correctAnswers structure for scoring.');
                }

                if (totalQuestions > 0) {
                    calculatedScore = (correctCount / totalQuestions) * exercise.points; // Calcula el score basado en los puntos del ejercicio
                }
            } else {
                // Si no hay respuestas correctas definidas, el score es 0 o se lanza un error
                throw new BadRequestException('Exercise does not have correct answers defined for scoring.');
            }

            progress.score = calculatedScore;
            progress.isCompleted = true;

            await queryRunner.manager.save(progress);

            // Actualizar las estadísticas generales del ejercicio
            await this.exercisesService.updateStats(exercise.id, calculatedScore);

            // Recalcular el progreso del módulo después de completar un ejercicio
            if (exercise.lesson && exercise.lesson.unity && exercise.lesson.unity.module) {
                await this.userModuleProgressService.calculateModuleProgress(
                    progress.user.id,
                    exercise.lesson.unity.module.id,
                );
            }

            await queryRunner.commitTransaction();
            return progress;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }
}
