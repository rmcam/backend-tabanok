import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';
import { Lesson } from '../lesson/entities/lesson.entity';
import { CreateContentDto } from './dto/create-content.dto';
import { ContentOrderItem } from './dto/reorder-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { Content } from './entities/content.entity';
import { ContentType } from './enums/content-type.enum';
import { FileService } from './services/file.service';

@Injectable()
export class ContentService {
    constructor(
        @InjectRepository(Content)
        private readonly contentRepository: Repository<Content>,
        @InjectRepository(Lesson)
        private readonly lessonRepository: Repository<Lesson>,
        private readonly fileService: FileService,
    ) { }

    async create(createContentDto: CreateContentDto): Promise<Content> {
        const lesson = await this.lessonRepository.findOne({
            where: { id: createContentDto.lessonId }
        });

        if (!lesson) {
            throw new NotFoundException(`Lección con ID ${createContentDto.lessonId} no encontrada`);
        }

        const content = this.contentRepository.create(createContentDto);

        // Validar que el tipo de contenido coincida con los campos proporcionados
        this.validateContentTypeFields(content);

        // Asignar el orden más alto + 1 si no se especifica
        if (!content.order) {
            const maxOrder = await this.getMaxOrder(content.lessonId);
            content.order = maxOrder + 1;
        }

        return this.contentRepository.save(content);
    }

    async findAll(paginationDto: PaginationDto): Promise<PaginatedResponse<Content>> {
        const { page = 1, limit = 10 } = paginationDto;
        const skip = (page - 1) * limit;

        const [items, total] = await this.contentRepository.findAndCount({
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
            relations: ['lesson'],
        });

        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: string): Promise<Content> {
        const content = await this.contentRepository.findOne({
            where: { id },
            relations: ['lesson'],
        });
        if (!content) {
            throw new NotFoundException(`Contenido con ID ${id} no encontrado`);
        }
        return content;
    }

    async findByLesson(lessonId: string, paginationDto: PaginationDto): Promise<PaginatedResponse<Content>> {
        const { page = 1, limit = 10 } = paginationDto;
        const skip = (page - 1) * limit;

        const [items, total] = await this.contentRepository.findAndCount({
            where: { lessonId },
            skip,
            take: limit,
            order: { order: 'ASC' },
            relations: ['lesson'],
        });

        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findByType(type: ContentType, paginationDto: PaginationDto): Promise<PaginatedResponse<Content>> {
        const { page = 1, limit = 10 } = paginationDto;
        const skip = (page - 1) * limit;

        const [items, total] = await this.contentRepository.findAndCount({
            where: { type },
            skip,
            take: limit,
            order: { createdAt: 'DESC' },
            relations: ['lesson'],
        });

        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async update(id: string, updateContentDto: UpdateContentDto): Promise<Content> {
        const content = await this.findOne(id);

        // Si se está actualizando el tipo, validar los campos
        if (updateContentDto.type) {
            Object.assign(content, updateContentDto);
            this.validateContentTypeFields(content);
        }

        const updated = Object.assign(content, updateContentDto);
        return this.contentRepository.save(updated);
    }

    async remove(id: string): Promise<void> {
        const content = await this.findOne(id);

        // Si hay un archivo asociado, eliminarlo
        if (content.fileUrl) {
            await this.fileService.deleteFile(content.fileUrl);
        }

        await this.contentRepository.remove(content);
    }

    async reorderContents(items: ContentOrderItem[]): Promise<void> {
        await Promise.all(
            items.map(item =>
                this.contentRepository.update(item.id, { order: item.order }),
            ),
        );
    }

    async toggleActive(id: string): Promise<Content> {
        const content = await this.findOne(id);
        content.isActive = !content.isActive;
        return this.contentRepository.save(content);
    }

    async updateDuration(id: string, duration: number): Promise<Content> {
        const content = await this.findOne(id);

        if (![ContentType.VIDEO, ContentType.AUDIO].includes(content.type)) {
            throw new BadRequestException('Solo se puede actualizar la duración de contenido de audio o video');
        }

        content.duration = duration;
        return this.contentRepository.save(content);
    }

    private async getMaxOrder(lessonId: string): Promise<number> {
        const result = await this.contentRepository
            .createQueryBuilder('content')
            .where('content.lessonId = :lessonId', { lessonId })
            .select('MAX(content.order)', 'maxOrder')
            .getRawOne();

        return result.maxOrder || 0;
    }

    private validateContentTypeFields(content: Content): void {
        switch (content.type) {
            case ContentType.TEXT:
                if (!content.textContent) {
                    throw new BadRequestException('El contenido de texto es requerido para tipo TEXT');
                }
                break;
            case ContentType.VIDEO:
            case ContentType.AUDIO:
            case ContentType.IMAGE:
            case ContentType.DOCUMENT:
                if (!content.fileUrl) {
                    throw new BadRequestException(`La URL del archivo es requerida para tipo ${content.type}`);
                }
                break;
        }
    }
} 