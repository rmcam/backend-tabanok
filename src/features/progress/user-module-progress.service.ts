import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserModuleProgress } from './entities/user-module-progress.entity';
import { CreateUserModuleProgressDto } from './dto/create-user-module-progress.dto';
import { UpdateUserModuleProgressDto } from './dto/update-user-module-progress.dto';
import { User } from '../../auth/entities/user.entity';
import { Module } from '../module/entities/module.entity';
import { Progress } from './entities/progress.entity';
import { Unity } from '../unity/entities/unity.entity';
import { Lesson } from '../lesson/entities/lesson.entity';
import { Exercise } from '../exercises/entities/exercise.entity';
import { UserUnityProgressService } from './user-unity-progress.service'; // Nueva importación

@Injectable()
export class UserModuleProgressService {
    constructor(
        @InjectRepository(UserModuleProgress)
        private readonly userModuleProgressRepository: Repository<UserModuleProgress>,
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Module)
        private readonly moduleRepository: Repository<Module>,
        @InjectRepository(Progress)
        private readonly progressRepository: Repository<Progress>,
        private readonly userUnityProgressService: UserUnityProgressService, // Nuevo servicio
        private dataSource: DataSource,
    ) { }

    async create(createUserModuleProgressDto: CreateUserModuleProgressDto): Promise<UserModuleProgress> {
        const { userId, moduleId, ...rest } = createUserModuleProgressDto;

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        const module = await this.moduleRepository.findOne({ where: { id: moduleId } });
        if (!module) {
            throw new NotFoundException(`Module with ID ${moduleId} not found`);
        }

        const existingProgress = await this.userModuleProgressRepository.findOne({
            where: { user: { id: userId }, module: { id: moduleId } },
        });

        if (existingProgress) {
            // Si ya existe, se podría actualizar o simplemente devolver el existente
            return existingProgress;
        }

        const userModuleProgress = this.userModuleProgressRepository.create({
            user,
            module,
            ...rest,
        });
        return await this.userModuleProgressRepository.save(userModuleProgress);
    }

    async findAll(): Promise<UserModuleProgress[]> {
        return await this.userModuleProgressRepository.find({
            relations: ['user', 'module'],
        });
    }

    async findOne(id: string): Promise<UserModuleProgress> {
        const userModuleProgress = await this.userModuleProgressRepository.findOne({
            where: { id },
            relations: ['user', 'module'],
        });

        if (!userModuleProgress) {
            throw new NotFoundException(`UserModuleProgress with ID ${id} not found`);
        }
        return userModuleProgress;
    }

    async findByUserAndModule(userId: string, moduleId: string): Promise<UserModuleProgress> {
        const userModuleProgress = await this.userModuleProgressRepository.findOne({
            where: { user: { id: userId }, module: { id: moduleId } },
            relations: ['user', 'module'],
        });

        if (!userModuleProgress) {
            throw new NotFoundException(`Progress for user ${userId} in module ${moduleId} not found`);
        }
        return userModuleProgress;
    }

    async findByUser(userId: string): Promise<UserModuleProgress[]> {
        return await this.userModuleProgressRepository.find({
            where: { user: { id: userId } },
            relations: ['module'],
        });
    }

    async update(id: string, updateUserModuleProgressDto: UpdateUserModuleProgressDto): Promise<UserModuleProgress> {
        const userModuleProgress = await this.findOne(id);
        Object.assign(userModuleProgress, updateUserModuleProgressDto);
        return await this.userModuleProgressRepository.save(userModuleProgress);
    }

    async remove(id: string): Promise<void> {
        const result = await this.userModuleProgressRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundException(`UserModuleProgress with ID ${id} not found`);
        }
    }

    async calculateModuleProgress(userId: string, moduleId: string): Promise<UserModuleProgress> {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const module = await queryRunner.manager.findOne(Module, {
                where: { id: moduleId },
                relations: ['unities', 'unities.lessons', 'unities.lessons.exercises'],
            });

            if (!module) {
                throw new NotFoundException(`Module with ID ${moduleId} not found`);
            }

            const user = await queryRunner.manager.findOne(User, { where: { id: userId } });
            if (!user) {
                throw new NotFoundException(`User with ID ${userId} not found`);
            }

            let totalExercisesInModule = 0;
            let completedExercisesInModule = 0;
            let totalScoreInModule = 0;

            for (const unity of module.unities) {
                // Recalcular el progreso de la unidad
                const unityProgress = await this.userUnityProgressService.calculateUnityProgress(userId, unity.id);

                // Sumar los ejercicios y puntuaciones de la unidad
                totalExercisesInModule += unity.lessons.flatMap(lesson => lesson.exercises).length;
                completedExercisesInModule += unityProgress.completedExercisesCount; // Usar el conteo real de ejercicios completados de la unidad
                totalScoreInModule += unityProgress.score;
            }

            const completionPercentage = totalExercisesInModule === 0
                ? 0
                : (completedExercisesInModule / totalExercisesInModule) * 100;

            const isCompleted = completedExercisesInModule === totalExercisesInModule && totalExercisesInModule > 0;

            let userModuleProgress = await queryRunner.manager.findOne(UserModuleProgress, {
                where: { user: { id: userId }, module: { id: moduleId } },
            });

            if (!userModuleProgress) {
                userModuleProgress = this.userModuleProgressRepository.create({
                    user,
                    module,
                    isCompleted,
                    completionPercentage,
                    score: totalScoreInModule,
                });
            } else {
                userModuleProgress.isCompleted = isCompleted;
                userModuleProgress.completionPercentage = completionPercentage;
                userModuleProgress.score = totalScoreInModule;
            }

            await queryRunner.manager.save(userModuleProgress);
            await queryRunner.commitTransaction();
            return userModuleProgress;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async calculateAllModulesProgressForUser(userId: string): Promise<UserModuleProgress[]> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User with ID ${userId} not found`);
        }

        const modules = await this.moduleRepository.find();
        const allUserModuleProgress: UserModuleProgress[] = [];

        for (const module of modules) {
            try {
                const moduleProgress = await this.calculateModuleProgress(userId, module.id);
                allUserModuleProgress.push(moduleProgress);
            } catch (error) {
                console.error(`Error calculating progress for module ${module.id} for user ${userId}: ${error.message}`);
                // Dependiendo de la lógica de negocio, se podría optar por lanzar el error,
                // o simplemente omitir este módulo y continuar con los demás.
                // Por ahora, simplemente se registra el error y se continúa.
            }
        }
        return allUserModuleProgress;
    }
}
