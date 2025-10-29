import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner, Not, IsNull, In } from 'typeorm';
import { CreateProgressDto } from './dto/create-progress.dto';
import { UpdateOverallProgressDto } from './dto/update-overall-progress.dto';
import { Progress } from './entities/progress.entity';
import { Exercise } from '../exercises/entities/exercise.entity';
import { ExercisesService } from '../exercises/exercises.service';
import { User } from '../../auth/entities/user.entity';
import { ExerciseEvaluatorFactory } from './evaluators/exercise-evaluator.factory';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { UserModuleProgress } from './entities/user-module-progress.entity';
import { UserUnityProgress } from './entities/user-unity-progress.entity';
import { UserLessonProgress } from './entities/user-lesson-progress.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { Unity } from '../unity/entities/unity.entity';
import { Module } from '../module/entities/module.entity';

@Injectable()
export class ProgressService {
    constructor(
        @InjectRepository(Progress)
        private readonly progressRepository: Repository<Progress>,
        @InjectRepository(Exercise)
        private readonly exerciseRepository: Repository<Exercise>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(UserModuleProgress)
        private readonly userModuleProgressRepository: Repository<UserModuleProgress>,
        @InjectRepository(UserUnityProgress)
        private readonly userUnityProgressRepository: Repository<UserUnityProgress>,
        @InjectRepository(UserLessonProgress)
        private readonly userLessonProgressRepository: Repository<UserLessonProgress>,
        @InjectRepository(Lesson)
        private readonly lessonRepository: Repository<Lesson>,
        @InjectRepository(Unity)
        private readonly unityRepository: Repository<Unity>,
        @InjectRepository(Module)
        private readonly moduleRepository: Repository<Module>,
        private readonly exercisesService: ExercisesService,
        private readonly exerciseEvaluatorFactory: ExerciseEvaluatorFactory,
        private dataSource: DataSource,
        private eventEmitter: EventEmitter2,
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

    async findAll(paginationDto: PaginationDto): Promise<Progress[]> {
        const { limit, page } = paginationDto;
        return await this.progressRepository.find({
            where: { isActive: true },
            relations: ['user', 'exercise'],
            select: {
                id: true,
                score: true,
                isCompleted: true,
                answers: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                user: {
                    id: true,
                },
                exercise: {
                    id: true,
                    title: true,
                    type: true,
                    difficulty: true,
                },
            },
            take: limit,
            skip: (page - 1) * limit,
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

    async findByUser(
        userId: string,
        options: {
            paginationDto?: PaginationDto;
            moduleId?: string;
            unityId?: string;
            lessonId?: string;
            exerciseId?: string;
            includeExercises?: boolean;
            includeModules?: boolean;
        },
    ): Promise<any> {
        const { paginationDto, moduleId, unityId, lessonId, exerciseId, includeExercises, includeModules } = options;
        const { limit, page } = paginationDto || { limit: 10, page: 1 }; // Valores por defecto si paginationDto no está presente

        const queryBuilder = this.progressRepository
            .createQueryBuilder('progress')
            .leftJoin('progress.user', 'user')
            .leftJoin('progress.exercise', 'exercise')
            .where('user.id = :userId', { userId })
            .andWhere('progress.isActive = true')
            .select([
                'progress.id',
                'progress.score',
                'progress.isCompleted',
                'progress.answers',
                'progress.isActive',
                'progress.createdAt',
                'progress.updatedAt',
                'user.id',
                'exercise.id',
                'exercise.title',
                'exercise.type',
                'exercise.difficulty',
            ]);

        if (exerciseId) {
            queryBuilder
                .leftJoin('exercise.lesson', 'lesson')
                .leftJoin('lesson.unity', 'unity')
                .leftJoin('unity.module', 'module')
                .addSelect(['lesson.id', 'lesson.title', 'unity.id', 'unity.title', 'module.id', 'module.name'])
                .andWhere('exercise.id = :exerciseId', { exerciseId });
            return await queryBuilder.getMany();
        }

        if (lessonId) {
            queryBuilder
                .leftJoin('exercise.lesson', 'lesson')
                .leftJoin('lesson.unity', 'unity')
                .leftJoin('unity.module', 'module')
                .addSelect(['lesson.id', 'lesson.title', 'unity.id', 'unity.title', 'module.id', 'module.name'])
                .andWhere('lesson.id = :lessonId', { lessonId });
            if (includeExercises) {
                return await queryBuilder.getMany();
            }
            return await this.calculateLessonProgress(userId, lessonId);
        }

        if (unityId) {
            queryBuilder
                .leftJoin('exercise.lesson', 'lesson')
                .leftJoin('lesson.unity', 'unity')
                .leftJoin('unity.module', 'module')
                .addSelect(['lesson.id', 'lesson.title', 'unity.id', 'unity.title', 'module.id', 'module.name'])
                .andWhere('unity.id = :unityId', { unityId });
            if (includeExercises) {
                return await queryBuilder.getMany();
            }
            return await this.calculateUnityProgress(userId, unityId);
        }

        if (moduleId) {
            queryBuilder
                .leftJoin('exercise.lesson', 'lesson')
                .leftJoin('lesson.unity', 'unity')
                .leftJoin('unity.module', 'module')
                .addSelect(['lesson.id', 'lesson.title', 'unity.id', 'unity.title', 'module.id', 'module.name'])
                .andWhere('module.id = :moduleId', { moduleId });
            if (includeExercises) {
                return await queryBuilder.getMany();
            }
            return await this.calculateModuleProgress(userId, moduleId);
        }

        if (includeModules) {
            const modules = await this.moduleRepository.find();
            const allModuleProgress = await Promise.all(
                modules.map(async (module) => {
                    return await this.calculateModuleProgress(userId, module.id);
                }),
            );
            return allModuleProgress.filter(Boolean);
        }

        queryBuilder.take(limit).skip((page - 1) * limit);
        return await queryBuilder.getMany();
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

            // Emitir evento para recalcular el progreso de la lección
            if (exercise.lesson) {
                this.eventEmitter.emit('lesson.progress.completed', {
                    userId: progress.user.id,
                    lessonId: exercise.lesson.id,
                });
                // Emitir evento para recalcular el progreso de la unidad
                if (exercise.lesson.unity) {
                    this.eventEmitter.emit('unity.progress.completed', {
                        userId: progress.user.id,
                        unityId: exercise.lesson.unity.id,
                    });
                }
            }

            // Emitir evento para recalcular el progreso del módulo
            if (exercise.lesson && exercise.lesson.unity && exercise.lesson.unity.module) {
                this.eventEmitter.emit('module.progress.completed', {
                    userId: progress.user.id,
                    moduleId: exercise.lesson.unity.module.id,
                });
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

    @OnEvent('module.progress.completed')
    async handleModuleProgressCompleted(payload: { userId: string; moduleId: string }) {
        await this.calculateModuleProgress(payload.userId, payload.moduleId);
    }

    @OnEvent('unity.progress.completed')
    async handleUnityProgressCompleted(payload: { userId: string; unityId: string }) {
        await this.calculateUnityProgress(payload.userId, payload.unityId);
    }

    @OnEvent('lesson.progress.completed')
    async handleLessonProgressCompleted(payload: { userId: string; lessonId: string }) {
        await this.calculateLessonProgress(payload.userId, payload.lessonId);
    }

    async calculateModuleProgress(userId: string, moduleId: string): Promise<UserModuleProgress> {
        const unities = await this.unityRepository.find({ where: { module: { id: moduleId } }, relations: ['lessons'] });
        if (unities.length === 0) {
            // No hay unidades, el progreso es 0 o 100 si no hay lecciones? Asumamos 0.
            return;
        }

        let totalProgress = 0;
        for (const unity of unities) {
            const unityProgress = await this.calculateUnityProgress(userId, unity.id);
            totalProgress += unityProgress?.completionPercentage || 0;
        }

        const averageProgress = totalProgress / unities.length;

        const user = await this.userRepository.findOne({ where: { id: userId }, select: ['id'] });
        const module = await this.moduleRepository.findOne({ where: { id: moduleId }, select: ['id', 'name'] });

        let moduleProgress = await this.userModuleProgressRepository.findOne({
            where: { user: { id: userId }, module: { id: moduleId } },
            relations: ['user', 'module'],
            select: {
                id: true,
                isCompleted: true,
                completionPercentage: true,
                score: true,
                isActive: true,
                createdAt: true,
                updatedAt: true,
                user: { id: true },
                module: { id: true, name: true },
            },
        });
        if (!moduleProgress) {
            moduleProgress = this.userModuleProgressRepository.create({ user, module, completionPercentage: averageProgress });
        } else {
            moduleProgress.completionPercentage = averageProgress;
        }
        return this.userModuleProgressRepository.save(moduleProgress);
    }

    async calculateUnityProgress(userId: string, unityId: string): Promise<UserUnityProgress> {
        const lessons = await this.lessonRepository.find({ where: { unity: { id: unityId } } });
        if (lessons.length === 0) {
            return;
        }

        let totalProgress = 0;
        for (const lesson of lessons) {
            const lessonProgress = await this.calculateLessonProgress(userId, lesson.id);
            totalProgress += lessonProgress?.completionPercentage || 0;
        }

        const averageProgress = totalProgress / lessons.length;

        const user = await this.userRepository.findOne({ where: { id: userId }, select: ['id'] });
        const unity = await this.unityRepository.findOne({ where: { id: unityId }, select: ['id', 'title'] });

        let unityProgress = await this.userUnityProgressRepository.findOne({
            where: { user: { id: userId }, unity: { id: unityId } },
            relations: ['user', 'unity'],
            select: {
                id: true,
                isCompleted: true,
                completionPercentage: true,
                score: true,
                completedExercisesCount: true,
                createdAt: true,
                updatedAt: true,
                user: { id: true },
                unity: { id: true, title: true },
            },
        });
        if (!unityProgress) {
            unityProgress = this.userUnityProgressRepository.create({ user, unity, completionPercentage: averageProgress });
        } else {
            unityProgress.completionPercentage = averageProgress;
        }
        return this.userUnityProgressRepository.save(unityProgress);
    }

    async calculateLessonProgress(userId: string, lessonId: string): Promise<UserLessonProgress> {
        const exercises = await this.exerciseRepository.find({ where: { lesson: { id: lessonId } } });
        if (exercises.length === 0) {
            return;
        }

        const completedExercises = await this.progressRepository.count({
            where: {
                user: { id: userId },
                exercise: { id: In(exercises.map(e => e.id)) },
                isCompleted: true,
            },
        });

        const progressPercentage = (completedExercises / exercises.length) * 100;

        const user = await this.userRepository.findOne({ where: { id: userId }, select: ['id'] });
        const lesson = await this.lessonRepository.findOne({ where: { id: lessonId }, select: ['id', 'title'] });

        let lessonProgress = await this.userLessonProgressRepository.findOne({
            where: { user: { id: userId }, lesson: { id: lessonId } },
            relations: ['user', 'lesson'],
            select: {
                id: true,
                isCompleted: true,
                completionPercentage: true,
                score: true,
                completedExercisesCount: true,
                createdAt: true,
                updatedAt: true,
                user: { id: true },
                lesson: { id: true, title: true },
            },
        });
        if (!lessonProgress) {
            lessonProgress = this.userLessonProgressRepository.create({ user, lesson, completionPercentage: progressPercentage });
        } else {
            lessonProgress.completionPercentage = progressPercentage;
        }
        return this.userLessonProgressRepository.save(lessonProgress);
    }

}
