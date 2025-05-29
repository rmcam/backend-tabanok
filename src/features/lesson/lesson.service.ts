import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { Lesson } from './entities/lesson.entity';

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

    async findAll(): Promise<Lesson[]> {
        return await this.lessonRepository.find({
            where: { isActive: true },
            order: { order: 'ASC' },
            relations: ['exercises'],
        });
    }

    async findOne(id: string): Promise<Lesson> {
        const lesson = await this.lessonRepository.findOne({
            where: { id, isActive: true },
            relations: ['exercises'],
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

    async findByUnity(unityId: string): Promise<Lesson[]> {
        return this.lessonRepository.find({
            where: { unityId, isActive: true },
            order: { order: 'ASC' },
            relations: ['multimedia', 'exercises'],
        });
    }

    async markAsCompleted(id: string): Promise<void> {
        const lesson = await this.findOne(id);
        lesson.isCompleted = true;
        await this.lessonRepository.save(lesson);
    }

    async findFeatured(): Promise<Lesson[]> {
        return await this.lessonRepository.find({
            where: { isFeatured: true, isActive: true },
            order: { order: 'ASC' },
            relations: ['multimedia'], // Cargar la relación multimedia
        });
    }
}
