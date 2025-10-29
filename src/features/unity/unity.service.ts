import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUnityDto } from './dto/create-unity.dto';
import { UpdateUnityDto } from './dto/update-unity.dto';
import { Unity } from './entities/unity.entity';
import { User } from '../../auth/entities/user.entity';
import { ExercisesService } from '../exercises/exercises.service';
import { PaginationDto } from '../../common/dto/pagination.dto'; // Importar PaginationDto

@Injectable()
export class UnityService {
    constructor(
        @InjectRepository(Unity)
        private readonly unityRepository: Repository<Unity>,
        private readonly exercisesService: ExercisesService,
    ) { }

    async findAll(user: User, paginationDto: PaginationDto): Promise<Unity[]> {
        if (!user) {
            throw new UnauthorizedException('Usuario no autenticado');
        }

        const { limit, page } = paginationDto;

        const unities = await this.unityRepository.find({
            relations: ["lessons", "lessons.topics"],
            select: {
                id: true,
                title: true,
                description: true,
                order: true,
                isLocked: true,
                requiredPoints: true,
                isActive: true,
                lessons: {
                    id: true,
                    title: true,
                    description: true,
                    order: true,
                    isLocked: true,
                    isCompleted: true,
                    isFeatured: true,
                    requiredPoints: true,
                    isActive: true,
                    topics: {
                        id: true,
                        title: true,
                        description: true,
                        order: true,
                        isLocked: true,
                        requiredPoints: true,
                        isActive: true,
                    }
                }
            },
            order: { order: 'ASC' },
            take: limit,
            skip: (page - 1) * limit,
        });

        return unities;
    }

    async create(createUnityDto: CreateUnityDto): Promise<Unity> {
        const unity = this.unityRepository.create(createUnityDto);
        return this.unityRepository.save(unity);
    }

    async findOne(id: string): Promise<Unity> {
        const unity = await this.unityRepository.findOne({
            where: { id },
            relations: ["lessons", "lessons.topics"],
            select: {
                id: true,
                title: true,
                description: true,
                order: true,
                isLocked: true,
                requiredPoints: true,
                isActive: true,
                lessons: {
                    id: true,
                    title: true,
                    description: true,
                    order: true,
                    isLocked: true,
                    isCompleted: true,
                    isFeatured: true,
                    requiredPoints: true,
                    isActive: true,
                    topics: {
                        id: true,
                        title: true,
                        description: true,
                        order: true,
                        isLocked: true,
                        requiredPoints: true,
                        isActive: true,
                    }
                }
            }
        });

        if (!unity) {
            throw new NotFoundException(`Unidad con ID ${id} no encontrada`);
        }

        return unity;
    }

    async findOneWithTopicsAndContent(id: string): Promise<Unity> {
        const unity = await this.unityRepository.findOne({
            where: { id },
            relations: [
                "lessons",
                "lessons.topics",
                "lessons.topics.exercises",
                "lessons.multimedia",
            ],
            select: {
                id: true,
                title: true,
                description: true,
                order: true,
                isLocked: true,
                requiredPoints: true,
                isActive: true,
                lessons: {
                    id: true,
                    title: true,
                    description: true,
                    order: true,
                    isLocked: true,
                    isCompleted: true,
                    isFeatured: true,
                    requiredPoints: true,
                    isActive: true,
                    multimedia: {
                        id: true,
                        fileName: true,
                        filePath: true,
                        fileType: true,
                        mimeType: true,
                        size: true,
                        userId: true,
                        uploadDate: true,
                    },
                    topics: {
                        id: true,
                        title: true,
                        description: true,
                        order: true,
                        isLocked: true,
                        requiredPoints: true,
                        isActive: true,
                        exercises: {
                            id: true,
                            title: true,
                            description: true,
                            type: true,
                            difficulty: true,
                            points: true,
                            timeLimit: true,
                            isActive: true,
                        }
                    }
                }
            }
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

    async findAllWithLessons(paginationDto: PaginationDto): Promise<Unity[]> {
        const { limit, page } = paginationDto;
        return this.unityRepository.find({
            relations: ["lessons", "lessons.topics"],
            select: {
                id: true,
                title: true,
                description: true,
                order: true,
                isLocked: true,
                requiredPoints: true,
                isActive: true,
                lessons: {
                    id: true,
                    title: true,
                    description: true,
                    order: true,
                    isLocked: true,
                    isCompleted: true,
                    isFeatured: true,
                    requiredPoints: true,
                    isActive: true,
                    topics: {
                        id: true,
                        title: true,
                        description: true,
                        order: true,
                        isLocked: true,
                        requiredPoints: true,
                        isActive: true,
                    }
                }
            },
            order: { order: 'ASC' },
            take: limit,
            skip: (page - 1) * limit,
        });
    }
}
