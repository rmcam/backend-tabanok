import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUnityDto } from './dto/create-unity.dto';
import { UpdateUnityDto } from './dto/update-unity.dto';
import { Unity } from './entities/unity.entity';
import { User } from '../../auth/entities/user.entity';
import { ExercisesService } from '../exercises/exercises.service';

@Injectable()
export class UnityService {
    constructor(
        @InjectRepository(Unity)
        private readonly unityRepository: Repository<Unity>,
        private readonly exercisesService: ExercisesService,
    ) { }

    async create(createUnityDto: CreateUnityDto): Promise<Unity> {
        const unity = this.unityRepository.create(createUnityDto);
        return this.unityRepository.save(unity);
    }

    async findAll(user: User): Promise<Unity[]> {
        if (!user) {
            throw new UnauthorizedException('Usuario no autenticado');
        }

        const unities = await this.unityRepository.find({
            relations: ["lessons", "lessons.topics", "lessons.multimedia"],
            order: { order: 'ASC' },
        });

        for (const unity of unities) {
            for (const lesson of unity.lessons) {
                for (const topic of lesson.topics) {
                    topic.exercises = await this.exercisesService.findByTopic(topic.id);
                }
            }
        }

        return unities;
    }

    async findOne(id: string): Promise<Unity> {
        const unity = await this.unityRepository.findOne({
            where: { id },
            relations: ["lessons", "lessons.topics", "lessons.multimedia"],
        });

        if (!unity) {
            throw new NotFoundException(`Unidad con ID ${id} no encontrada`);
        }

        for (const lesson of unity.lessons) {
            for (const topic of lesson.topics) {
                topic.exercises = await this.exercisesService.findByTopic(topic.id);
            }
        }

        return unity;
    }

    async update(id: string, updateUnityDto: UpdateUnityDto): Promise<Unity> {
        const unity = await this.findOne(id);
        Object.assign(unity, updateUnityDto);
        return this.unityRepository.save(unity);
    }

    async remove(id: string): Promise<void> {
        const unity = await this.findOne(id);
        await this.unityRepository.remove(unity);
    }

    async toggleLock(id: string): Promise<Unity> {
        const unity = await this.findOne(id);
        unity.isLocked = !unity.isLocked;
        return this.unityRepository.save(unity);
    }

    async updatePoints(id: string, points: number): Promise<Unity> {
        const unity = await this.findOne(id);
        unity.requiredPoints = points;
        return this.unityRepository.save(unity);
    }
}
