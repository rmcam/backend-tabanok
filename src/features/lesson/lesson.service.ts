import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson } from './entities/lesson.entity';
import { PaginationDto } from '../../common/dto/pagination.dto'; // Importar PaginationDto

@Injectable()
export class LessonService {
    constructor(
        @InjectRepository(Lesson)
        private readonly lessonRepository: Repository<Lesson>,
    ) { }

    async create(createLessonDto: CreateLessonDto): Promise<Lesson> {
        const lesson = this.lessonRepository.create(createLessonDto);
        return await this.lessonRepository.save(lesson);
    }

    async findAll(paginationDto: PaginationDto, isFeatured?: boolean, unityId?: string): Promise<Lesson[]> {
        const { limit, page } = paginationDto;
        const where: any = { isActive: true };
        const relations: string[] = ['topics', 'exercises', 'multimedia'];

        if (isFeatured) {
            where.isFeatured = true;
            // Si es destacada, solo necesitamos la multimedia para la imagen
            relations.splice(relations.indexOf('topics'), 1);
            relations.splice(relations.indexOf('exercises'), 1);
        }
        if (unityId) {
            where.unityId = unityId;
        }

        return await this.lessonRepository.find({
            where,
            order: { order: 'ASC' },
            relations,
            take: limit,
            skip: (page - 1) * limit,
        });
    }

    async findOne(id: string): Promise<Lesson> {
        const lesson = await this.lessonRepository.findOne({
            where: { id, isActive: true },
            relations: ['topics', 'exercises', 'multimedia'],
        });

        if (!lesson) {
            throw new NotFoundException(`Lesson with ID ${id} not found`);
        }

        return lesson;
    }

    async update(id: string, updateLessonDto: UpdateLessonDto): Promise<Lesson> {
        const lesson = await this.findOne(id);
        Object.assign(lesson, updateLessonDto);
        return await this.lessonRepository.save(lesson);
    }

    async remove(id: string): Promise<void> {
        const lesson = await this.findOne(id);
        lesson.isActive = false;
        await this.lessonRepository.save(lesson);
    }

    async toggleLock(id: string): Promise<Lesson> {
        const lesson = await this.findOne(id);
        lesson.isLocked = !lesson.isLocked;
        return this.lessonRepository.save(lesson);
    }

    async updatePoints(id: string, points: number): Promise<Lesson> {
        const lesson = await this.findOne(id);
        lesson.requiredPoints = points;
        return this.lessonRepository.save(lesson);
    }

    async markAsCompleted(id: string): Promise<void> {
        const lesson = await this.findOne(id);
        lesson.isCompleted = true;
        await this.lessonRepository.save(lesson);
    }
}
