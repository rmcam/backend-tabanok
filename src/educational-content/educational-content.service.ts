import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateContentDto } from './dto/create-content.dto';
import { EducationalContent } from './entities/content.entity';

@Injectable()
export class EducationalContentService {
    constructor(
        @InjectRepository(EducationalContent)
        private contentRepository: Repository<EducationalContent>,
    ) { }

    async create(createContentDto: CreateContentDto): Promise<EducationalContent> {
        const content = this.contentRepository.create(createContentDto);
        return await this.contentRepository.save(content);
    }

    async findAll(): Promise<EducationalContent[]> {
        return await this.contentRepository.find({
            where: { isActive: true },
            order: { level: 'ASC', createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<EducationalContent> {
        const content = await this.contentRepository.findOne({
            where: { id, isActive: true },
        });

        if (!content) {
            throw new NotFoundException(`Contenido educativo con ID ${id} no encontrado`);
        }

        return content;
    }

    async findByType(type: string): Promise<EducationalContent[]> {
        return await this.contentRepository.find({
            where: { type, isActive: true },
            order: { level: 'ASC' },
        });
    }

    async findByLevel(level: number): Promise<EducationalContent[]> {
        return await this.contentRepository.find({
            where: { level, isActive: true },
            order: { createdAt: 'DESC' },
        });
    }

    async update(id: string, updateContentDto: Partial<CreateContentDto>): Promise<EducationalContent> {
        const content = await this.findOne(id);
        Object.assign(content, updateContentDto);
        return await this.contentRepository.save(content);
    }

    async remove(id: string): Promise<void> {
        const content = await this.findOne(id);
        content.isActive = false;
        await this.contentRepository.save(content);
    }
} 