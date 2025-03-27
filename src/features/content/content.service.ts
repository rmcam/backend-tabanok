import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from '../lesson/entities/lesson.entity';
import { CreateContentDto } from './dto/create-content.dto';
import { Content, ContentType } from './entities/content.entity';

@Injectable()
export class ContentService {
    constructor(
        @InjectRepository(Content)
        private contentRepository: Repository<Content>,
        @InjectRepository(Lesson)
        private lessonRepository: Repository<Lesson>,
    ) { }

    async create(createContentDto: CreateContentDto): Promise<Content> {
        const { lessonId, ...contentData } = createContentDto;

        const lesson = await this.lessonRepository.findOne({
            where: { id: lessonId }
        });

        if (!lesson) {
            throw new NotFoundException(`Lección con ID ${lessonId} no encontrada`);
        }

        // Si no se especifica un orden, obtener el último orden y agregar 1
        if (!contentData.order) {
            const lastContent = await this.contentRepository.findOne({
                where: { lesson: { id: lessonId } },
                order: { order: 'DESC' }
            });
            contentData.order = lastContent ? lastContent.order + 1 : 1;
        }

        const content = this.contentRepository.create({
            ...contentData,
            lesson
        });

        return this.contentRepository.save(content);
    }

    async findAll(): Promise<Content[]> {
        return this.contentRepository.find({
            relations: ['lesson'],
            order: { order: 'ASC' }
        });
    }

    async findOne(id: number): Promise<Content> {
        const content = await this.contentRepository.findOne({
            where: { id },
            relations: ['lesson']
        });

        if (!content) {
            throw new NotFoundException(`Contenido con ID ${id} no encontrado`);
        }

        return content;
    }

    async findByLesson(lessonId: number): Promise<Content[]> {
        return this.contentRepository.find({
            where: { lesson: { id: lessonId } },
            order: { order: 'ASC' }
        });
    }

    async findByType(type: ContentType): Promise<Content[]> {
        return this.contentRepository.find({
            where: { type },
            relations: ['lesson'],
            order: { order: 'ASC' }
        });
    }

    async update(id: number, updateContentDto: Partial<CreateContentDto>): Promise<Content> {
        const { lessonId, ...contentData } = updateContentDto;
        const content = await this.findOne(id);

        if (lessonId) {
            const lesson = await this.lessonRepository.findOne({
                where: { id: lessonId }
            });

            if (!lesson) {
                throw new NotFoundException(`Lección con ID ${lessonId} no encontrada`);
            }

            content.lesson = lesson;
        }

        Object.assign(content, contentData);
        return this.contentRepository.save(content);
    }

    async remove(id: number): Promise<void> {
        const content = await this.findOne(id);
        await this.contentRepository.remove(content);
    }

    async reorderContents(lessonId: number): Promise<void> {
        const contents = await this.findByLesson(lessonId);
        for (let i = 0; i < contents.length; i++) {
            contents[i].order = i + 1;
            await this.contentRepository.save(contents[i]);
        }
    }

    async toggleActive(id: number): Promise<Content> {
        const content = await this.findOne(id);
        content.isActive = !content.isActive;
        return this.contentRepository.save(content);
    }

    async updateDuration(id: number, duration: number): Promise<Content> {
        const content = await this.findOne(id);
        content.duration = duration;
        return this.contentRepository.save(content);
    }
} 