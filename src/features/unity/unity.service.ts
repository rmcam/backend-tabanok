import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUnityDto } from './dto/create-unity.dto';
import { UpdateUnityDto } from './dto/update-unity.dto';
import { Unity } from './entities/unity.entity';

@Injectable()
export class UnityService {
    constructor(
        @InjectRepository(Unity)
        private readonly unityRepository: Repository<Unity>,
    ) { }

    async create(createUnityDto: CreateUnityDto): Promise<Unity> {
        const unity = this.unityRepository.create(createUnityDto);
        return await this.unityRepository.save(unity);
    }

    async findAll(): Promise<Unity[]> {
        return await this.unityRepository.find({
            where: { isActive: true },
            relations: ['topics'],
            order: { order: 'ASC' },
        });
    }

    async findOne(id: string): Promise<Unity> {
        const unity = await this.unityRepository.findOne({
            where: { id, isActive: true },
            relations: ['topics'],
        });

        if (!unity) {
            throw new NotFoundException(`Unity with ID ${id} not found`);
        }

        return unity;
    }

    async update(id: string, updateUnityDto: UpdateUnityDto): Promise<Unity> {
        const unity = await this.findOne(id);
        Object.assign(unity, updateUnityDto);
        return await this.unityRepository.save(unity);
    }

    async remove(id: string): Promise<void> {
        const unity = await this.findOne(id);
        unity.isActive = false;
        await this.unityRepository.save(unity);
    }

    async toggleLock(id: string): Promise<Unity> {
        const unity = await this.findOne(id);
        unity.isUnlocked = !unity.isUnlocked;
        return await this.unityRepository.save(unity);
    }

    async updatePoints(id: string, points: number): Promise<Unity> {
        const unity = await this.findOne(id);
        unity.requiredPoints = points;
        return await this.unityRepository.save(unity);
    }
} 