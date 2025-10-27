import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner, Not, IsNull } from 'typeorm';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateOverallProgressDto } from './dto/update-overall-progress.dto';
import { Progress } from './entities/progress.entity';
import { UserModuleProgressService } from './user-module-progress.service';
import { Exercise } from '../exercises/entities/exercise.entity';
import { ExercisesService } from '../exercises/exercises.service';
import { User } from '../../auth/entities/user.entity'; // Ruta corregida
import { ExerciseEvaluatorFactory } from './evaluators/exercise-evaluator.factory';
import { UserLessonProgressService } from './user-lesson-progress.service'; // Nueva importación
@Injectable()
export class ProgressService {
    constructor(
        @InjectRepository(Progress)
        private readonly progressRepository: Repository<Progress>,
        @InjectRepository(Exercise)
        private readonly exerciseRepository: Repository<Exercise>,
        @InjectRepository(User) // Inyectar UserRepository
        private readonly userRepository: Repository<User>,
        private readonly userModuleProgressService: UserModuleProgressService,
        private readonly userLessonProgressService: UserLessonProgressService, // Nuevo servicio
        private readonly exercisesService: ExercisesService,
        private readonly exerciseEvaluatorFactory: ExerciseEvaluatorFactory,
        private dataSource: DataSource,
    ) { }
    async create(createProgressDto: CreateProgressDto): Promise<Progress> {
        const { exerciseId, userId, ...rest } = createProgressDto;

        const exercise = await this.exerciseRepository.findOne({ where: { id: exerciseId } });
        if (!exercise) {
            throw new NotFoundException(`Exercise with ID ${exerciseId} not found`);
        }

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        const progress = this.progressRepository.create({
            ...rest,
            user, // Asociar la entidad User completa
            exercise, // Asociar la entidad Exercise completa
        });
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
            select: {
                id: true,
                score: true,
                isCompleted: true,
                answers: true, // Si las respuestas son necesarias, de lo contrario, se pueden omitir
                exercise: {
                    id: true,
                    title: true,
                    type: true,
                    difficulty: true,
                    // Añadir otros campos esenciales del ejercicio aquí
                },
            },
        });
    }

    async findExerciseProgressByUser(userId: string): Promise<Progress[]> {
        return await this.progressRepository.find({
            where: { user: { id: userId }, exercise: { id: Not(IsNull()) }, isActive: true },
            relations: ['exercise', 'user'], // Asegurarse de cargar la relación 'user' si se va a seleccionar su ID
            select: {
                id: true,
                score: true,
                isCompleted: true,
                answers: true,
                user: { // Seleccionar solo el ID del usuario
                    id: true,
                },
                exercise: {
                    id: true,
                    title: true,
                    type: true,
                    difficulty: true,
                },
            },
        });
    }

    async findExerciseProgressByUserAndModule(userId: string, moduleId: string): Promise<Progress[]> {
        return await this.progressRepository.find({
            where: {
                user: { id: userId },
                exercise: {
                    id: Not(IsNull()),
                    lesson: { unity: { module: { id: moduleId } } },
                },
                isActive: true,
            },
            relations: ['exercise', 'exercise.lesson', 'exercise.lesson.unity', 'exercise.lesson.unity.module', 'user'],
            select: {
                id: true,
                score: true,
                isCompleted: true,
                answers: true,
                user: { id: true },
                exercise: {
                    id: true,
                    title: true,
                    type: true,
                    difficulty: true,
                    lesson: {
                        id: true,
                        unity: {
                            id: true,
                            module: {
                                id: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async findExerciseProgressByUserAndLesson(userId: string, lessonId: string): Promise<Progress[]> {
        return await this.progressRepository.find({
            where: {
                user: { id: userId },
                exercise: {
                    id: Not(IsNull()),
                    lesson: { id: lessonId },
                },
                isActive: true,
            },
            relations: ['exercise', 'exercise.lesson', 'user'],
            select: {
                id: true,
                score: true,
                isCompleted: true,
                answers: true,
                user: { id: true },
                exercise: {
                    id: true,
                    title: true,
                    type: true,
                    difficulty: true,
                    lesson: {
                        id: true,
                    },
                },
            },
        });
    }

    async findExerciseProgressByUserAndUnity(userId: string, unityId: string): Promise<Progress[]> {
        return await this.progressRepository.find({
            where: {
                user: { id: userId },
                exercise: {
                    id: Not(IsNull()),
                    lesson: { unity: { id: unityId } },
                },
                isActive: true,
            },
            relations: ['exercise', 'exercise.lesson', 'exercise.lesson.unity', 'user'],
            select: {
                id: true,
                score: true,
                isCompleted: true,
                answers: true,
                user: { id: true },
                exercise: {
                    id: true,
                    title: true,
                    type: true,
                    difficulty: true,
                    lesson: {
                        id: true,
                        unity: {
                            id: true,
                        },
                    },
                },
            },
        });
    }

    async findByExercise(exerciseId: string): Promise<Progress[]> {
        return await this.progressRepository.find({
            where: { exercise: { id: exerciseId }, isActive: true },
            relations: ['user'],
        });
    }

    async update(id: string, updateOverallProgressDto: UpdateOverallProgressDto): Promise<Progress> {
        const progress = await this.findOne(id);
        Object.assign(progress, updateOverallProgressDto);
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

            if (!progress.exercise) {
                throw new BadRequestException(`Progress with ID ${id} does not have an associated exercise.`);
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

            let calculatedScore = 0;
            try {
                const evaluator = this.exerciseEvaluatorFactory.getEvaluator(exercise.type as any); // Cast to any for now
                calculatedScore = evaluator.evaluate(exercise, answers);
            } catch (error) {
                throw new BadRequestException(`Error evaluating exercise: ${error.message}`);
            }

            progress.score = calculatedScore;
            progress.isCompleted = true;

            await queryRunner.manager.save(progress);

            // Actualizar las estadísticas generales del ejercicio
            await this.exercisesService.updateStats(exercise.id, calculatedScore);

            // Recalcular el progreso de la lección después de completar un ejercicio
            if (exercise.lesson) {
                await this.userLessonProgressService.calculateLessonProgress(
                    progress.user.id,
                    exercise.lesson.id,
                );
            }

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
