import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserLessonProgress } from './entities/user-lesson-progress.entity';
import { CreateUserLessonProgressDto } from './dto/create-user-lesson-progress.dto';
import { UpdateUserLessonProgressDto } from './dto/update-user-lesson-progress.dto';
import { User } from '../../auth/entities/user.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { Progress } from './entities/progress.entity';
import { Exercise } from '../exercises/entities/exercise.entity';
import { forwardRef, Inject } from '@nestjs/common'; // Importar forwardRef e Inject
import { UserUnityProgressService } from './user-unity-progress.service'; // Nueva importación

@Injectable()
export class UserLessonProgressService {
    constructor(
        @InjectRepository(UserLessonProgress)
        private readonly userLessonProgressRepository: Repository<UserLessonProgress>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Lesson)
        private readonly lessonRepository: Repository<Lesson>,
        @InjectRepository(Progress)
        private readonly progressRepository: Repository<Progress>,
        @Inject(forwardRef(() => UserUnityProgressService)) // Usar forwardRef para dependencia circular
        private readonly userUnityProgressService: UserUnityProgressService,
        private dataSource: DataSource,
    ) { }

    async create(createUserLessonProgressDto: CreateUserLessonProgressDto): Promise<UserLessonProgress> {
        const { userId, lessonId, ...rest } = createUserLessonProgressDto;

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        const lesson = await this.lessonRepository.findOne({ where: { id: lessonId } });
        if (!lesson) {
            throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
        }

        const existingProgress = await this.userLessonProgressRepository.findOne({
            where: { user: { id: userId }, lesson: { id: lessonId } },
        });

        if (existingProgress) {
            return existingProgress;
        }

        const userLessonProgress = this.userLessonProgressRepository.create({
            user,
            lesson,
            ...rest,
        });
        return await this.userLessonProgressRepository.save(userLessonProgress);
    }

    async findAll(): Promise<UserLessonProgress[]> {
        return await this.userLessonProgressRepository.find({
            relations: ['user', 'lesson'],
        });
    }

    async findOne(id: string): Promise<UserLessonProgress> {
        const userLessonProgress = await this.userLessonProgressRepository.findOne({
            where: { id },
            relations: ['user', 'lesson'],
        });

        if (!userLessonProgress) {
            throw new NotFoundException(`UserLessonProgress with ID ${id} not found`);
        }
        return userLessonProgress;
    }

    async findByUserAndLesson(userId: string, lessonId: string): Promise<UserLessonProgress> {
        const userLessonProgress = await this.userLessonProgressRepository.findOne({
            where: { user: { id: userId }, lesson: { id: lessonId } },
            relations: ['user', 'lesson'],
        });

        if (!userLessonProgress) {
            throw new NotFoundException(`Progress for user ${userId} in lesson ${lessonId} not found`);
        }
        return userLessonProgress;
    }

    async findByUser(userId: string): Promise<UserLessonProgress[]> {
        return await this.userLessonProgressRepository.find({
            where: { user: { id: userId } },
            relations: ['lesson'],
        });
    }

    async update(id: string, updateUserLessonProgressDto: UpdateUserLessonProgressDto): Promise<UserLessonProgress> {
        const userLessonProgress = await this.findOne(id);
        Object.assign(userLessonProgress, updateUserLessonProgressDto);
        return await this.userLessonProgressRepository.save(userLessonProgress);
    }

    async remove(id: string): Promise<void> {
        const result = await this.userLessonProgressRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`UserLessonProgress with ID ${id} not found`);
        }
    }

    async calculateLessonProgress(userId: string, lessonId: string): Promise<UserLessonProgress> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const lesson = await queryRunner.manager.findOne(Lesson, {
                where: { id: lessonId },
                relations: ['exercises'],
            });

            if (!lesson) {
                throw new NotFoundException(`Lesson with ID ${lessonId} not found`);
            }

            const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
            if (!user) {
                throw new NotFoundException(`User with ID ${userId} not found`);
            }

            let totalExercisesInLesson = 0;
            let completedExercisesInLesson = 0;
            let totalScoreInLesson = 0;

            for (const exercise of lesson.exercises) {
                totalExercisesInLesson++;
                const progress = await queryRunner.manager.findOne(Progress, {
                    where: { user: { id: userId }, exercise: { id: exercise.id }, isCompleted: true },
                });
                if (progress) {
                    completedExercisesInLesson++;
                    totalScoreInLesson += progress.score;
                }
            }

            const completionPercentage = totalExercisesInLesson === 0
                ? 0
                : (completedExercisesInLesson / totalExercisesInLesson) * 100;

            const isCompleted = completedExercisesInLesson === totalExercisesInLesson && totalExercisesInLesson > 0;

            let userLessonProgress = await queryRunner.manager.findOne(UserLessonProgress, {
                where: { user: { id: userId }, lesson: { id: lessonId } },
            });

            if (!userLessonProgress) {
                userLessonProgress = this.userLessonProgressRepository.create({
                    user,
                    lesson,
                    isCompleted,
                    completionPercentage,
                    score: totalScoreInLesson,
                });
            } else {
                userLessonProgress.isCompleted = isCompleted;
                userLessonProgress.completionPercentage = completionPercentage;
                userLessonProgress.score = totalScoreInLesson;
            }

            await queryRunner.manager.save(userLessonProgress);
            await queryRunner.commitTransaction();

            // Recalcular el progreso de la unidad después de completar una lección
            if (lesson.unity) {
                await this.userUnityProgressService.calculateUnityProgress(
                    userId, // Usar userId directamente
                    lesson.unity.id,
                );
            }

            return userLessonProgress;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async calculateAllLessonsProgressForUser(userId: string): Promise<UserLessonProgress[]> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        const lessons = await this.lessonRepository.find();
        const allUserLessonProgress: UserLessonProgress[] = [];

        for (const lesson of lessons) {
            try {
                const lessonProgress = await this.calculateLessonProgress(userId, lesson.id);
                allUserLessonProgress.push(lessonProgress);
            } catch (error) {
                console.error(`Error calculating progress for lesson ${lesson.id} for user ${userId}: ${error.message}`);
            }
        }
        return allUserLessonProgress;
    }
}
