import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLevelDto } from './dto/create-level.dto';
import { Level, LevelType } from './entities/level.entity';

@Injectable()
export class LevelService {
    constructor(
        @InjectRepository(Level)
        private levelRepository: Repository<Level>,
    ) { }

    async create(createLevelDto: CreateLevelDto): Promise<Level> {
        const level = this.levelRepository.create(createLevelDto);

        // Si no se especifica un orden, obtener el último orden y agregar 1
        if (!level.order) {
            const lastLevel = await this.levelRepository.findOne({
                where: { type: level.type },
                order: { order: 'DESC' }
            });
            level.order = lastLevel ? lastLevel.order + 1 : 1;
        }

        return this.levelRepository.save(level);
    }

    async findAll(): Promise<Level[]> {
        return this.levelRepository.find({
            relations: ['lessons'],
            order: {
                type: 'ASC',
                order: 'ASC'
            }
        });
    }

    async findOne(id: number): Promise<Level> {
        const level = await this.levelRepository.findOne({
            where: { id },
            relations: ['lessons']
        });

        if (!level) {
            throw new NotFoundException(`Nivel con ID ${id} no encontrado`);
        }

        return level;
    }

    async findByType(type: LevelType): Promise<Level[]> {
        return this.levelRepository.find({
            where: { type },
            relations: ['lessons'],
            order: { order: 'ASC' }
        });
    }

    async update(id: number, updateLevelDto: Partial<CreateLevelDto>): Promise<Level> {
        const level = await this.findOne(id);
        Object.assign(level, updateLevelDto);
        return this.levelRepository.save(level);
    }

    async remove(id: number): Promise<void> {
        const level = await this.findOne(id);
        await this.levelRepository.remove(level);
    }

    async reorderLevels(type: LevelType): Promise<void> {
        const levels = await this.findByType(type);
        for (let i = 0; i < levels.length; i++) {
            levels[i].order = i + 1;
            await this.levelRepository.save(levels[i]);
        }
    }

    async unlockLevel(id: number): Promise<Level> {
        const level = await this.findOne(id);
        level.isLocked = false;
        return this.levelRepository.save(level);
    }

    async lockLevel(id: number): Promise<Level> {
        const level = await this.findOne(id);
        level.isLocked = true;
        return this.levelRepository.save(level);
    }

    async updateRequiredPoints(id: number, points: number): Promise<Level> {
        const level = await this.findOne(id);
        level.requiredPoints = points;
        return this.levelRepository.save(level);
    }
} 