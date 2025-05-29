import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUnityDto } from './dto/create-unity.dto';
import { UpdateUnityDto } from './dto/update-unity.dto';
import { Unity } from './entities/unity.entity';
import { User } from '../../auth/entities/user.entity'; // Import User entity

@Injectable()
export class UnityService {
    constructor(
        @InjectRepository(Unity)
        private readonly unityRepository: Repository<Unity>,
    ) { }

    async create(createUnityDto: CreateUnityDto): Promise<Unity> {
        const unity = this.unityRepository.create(createUnityDto);
        return this.unityRepository.save(unity);
    }

    async findAll(): Promise<Unity[]> {
        return this.unityRepository.find({
            order: { order: 'ASC' },
        });
    }

    async findOne(id: string): Promise<Unity> {
        const unity = await this.unityRepository.findOne({
            where: { id },
            relations: ['lessons'], // Cargar la relación 'lessons'
        });

        if (!unity) {
            throw new NotFoundException(`Unidad con ID ${id} no encontrada`);
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
