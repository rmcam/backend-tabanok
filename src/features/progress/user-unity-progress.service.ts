import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserUnityProgress } from './entities/user-unity-progress.entity';
import { CreateUserUnityProgressDto } from './dto/create-user-unity-progress.dto';
import { UpdateUserUnityProgressDto } from './dto/update-user-unity-progress.dto';
import { User } from '../../auth/entities/user.entity';
import { Unity } from '../unity/entities/unity.entity';
import { Progress } from './entities/progress.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { Exercise } from '../exercises/entities/exercise.entity';
import { forwardRef, Inject } from '@nestjs/common'; // Importar forwardRef e Inject
import { UserLessonProgressService } from './user-lesson-progress.service'; // Importar el servicio de progreso de lección

@Injectable()
export class UserUnityProgressService {
    constructor(
        @InjectRepository(UserUnityProgress)
        private readonly userUnityProgressRepository: Repository<UserUnityProgress>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Unity)
        private readonly unityRepository: Repository<Unity>,
        @InjectRepository(Progress)
        private readonly progressRepository: Repository<Progress>,
        @Inject(forwardRef(() => UserLessonProgressService)) // Usar forwardRef para dependencia circular
        private readonly userLessonProgressService: UserLessonProgressService,
        private dataSource: DataSource,
    ) { }

    async create(createUserUnityProgressDto: CreateUserUnityProgressDto): Promise<UserUnityProgress> {
        const { userId, unityId, ...rest } = createUserUnityProgressDto;

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        const unity = await this.unityRepository.findOne({ where: { id: unityId } });
        if (!unity) {
            throw new NotFoundException(`Unity with ID ${unityId} not found`);
        }

        const existingProgress = await this.userUnityProgressRepository.findOne({
            where: { user: { id: userId }, unity: { id: unityId } },
        });

        if (existingProgress) {
            return existingProgress;
        }

        const userUnityProgress = this.userUnityProgressRepository.create({
            user,
            unity,
            ...rest,
        });
        return await this.userUnityProgressRepository.save(userUnityProgress);
    }

    async findAll(): Promise<UserUnityProgress[]> {
        return await this.userUnityProgressRepository.find({
            relations: ['user', 'unity'],
        });
    }

    async findOne(id: string): Promise<UserUnityProgress> {
        const userUnityProgress = await this.userUnityProgressRepository.findOne({
            where: { id },
            relations: ['user', 'unity'],
        });

        if (!userUnityProgress) {
            throw new NotFoundException(`UserUnityProgress with ID ${id} not found`);
        }
        return userUnityProgress;
    }

    async findByUserAndUnity(userId: string, unityId: string): Promise<UserUnityProgress> {
        const userUnityProgress = await this.userUnityProgressRepository.findOne({
            where: { user: { id: userId }, unity: { id: unityId } },
            relations: ['user', 'unity'],
        });

        if (!userUnityProgress) {
            throw new NotFoundException(`Progress for user ${userId} in unity ${unityId} not found`);
        }
        return userUnityProgress;
    }

    async findByUser(userId: string): Promise<UserUnityProgress[]> {
        return await this.userUnityProgressRepository.find({
            where: { user: { id: userId } },
            relations: ['unity'],
        });
    }

    async update(id: string, updateUserUnityProgressDto: UpdateUserUnityProgressDto): Promise<UserUnityProgress> {
        const userUnityProgress = await this.findOne(id);
        Object.assign(userUnityProgress, updateUserUnityProgressDto);
        return await this.userUnityProgressRepository.save(userUnityProgress);
    }

    async remove(id: string): Promise<void> {
        const result = await this.userUnityProgressRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`UserUnityProgress with ID ${id} not found`);
        }
    }

    async calculateUnityProgress(userId: string, unityId: string): Promise<UserUnityProgress> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const unity = await queryRunner.manager.findOne(Unity, {
                where: { id: unityId },
                relations: ['lessons', 'lessons.exercises'],
            });

            if (!unity) {
                throw new NotFoundException(`Unity with ID ${unityId} not found`);
            }

            const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
            if (!user) {
                throw new NotFoundException(`User with ID ${userId} not found`);
            }

            let totalExercisesInUnity = 0;
            let completedExercisesInUnity = 0;
            let totalScoreInUnity = 0;

            // Asegurar que unity.lessons es un array de Lesson
            const lessons = unity.lessons as Lesson[];

            for (const lesson of lessons) {
                // Recalcular el progreso de la lección
                const lessonProgress = await this.userLessonProgressService.calculateLessonProgress(userId, lesson.id);
                
                totalExercisesInUnity += lesson.exercises.length;
                completedExercisesInUnity += lessonProgress.completedExercisesCount;
                totalScoreInUnity += lessonProgress.score;
            }

            const completionPercentage = totalExercisesInUnity === 0
                ? 0
                : (completedExercisesInUnity / totalExercisesInUnity) * 100;

            const isCompleted = completedExercisesInUnity === totalExercisesInUnity && totalExercisesInUnity > 0;

            let userUnityProgress = await queryRunner.manager.findOne(UserUnityProgress, {
                where: { user: { id: userId }, unity: { id: unityId } },
            });

            if (!userUnityProgress) {
                userUnityProgress = this.userUnityProgressRepository.create({
                    user,
                    unity,
                    isCompleted,
                    completionPercentage,
                    score: totalScoreInUnity,
                    completedExercisesCount: completedExercisesInUnity,
                });
            } else {
                userUnityProgress.isCompleted = isCompleted;
                userUnityProgress.completionPercentage = completionPercentage;
                userUnityProgress.score = totalScoreInUnity;
                userUnityProgress.completedExercisesCount = completedExercisesInUnity;
            }

            await queryRunner.manager.save(userUnityProgress);
            await queryRunner.commitTransaction();
            return userUnityProgress;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async calculateAllUnitiesProgressForUser(userId: string): Promise<UserUnityProgress[]> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        const unities = await this.unityRepository.find();
        const allUserUnityProgress: UserUnityProgress[] = [];

        for (const unity of unities) {
            try {
                const unityProgress = await this.calculateUnityProgress(userId, unity.id);
                allUserUnityProgress.push(unityProgress);
            } catch (error) {
                console.error(`Error calculating progress for unity ${unity.id} for user ${userId}: ${error.message}`);
            }
        }
        return allUserUnityProgress;
    }
}
