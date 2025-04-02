import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CulturalContent } from './cultural-content.entity';
import { CreateCulturalContentDto } from './dto/create-cultural-content.dto';
import { UpdateCulturalContentDto } from './dto/update-cultural-content.dto';

@Injectable()
export class CulturalContentService {
    constructor(
        @InjectRepository(CulturalContent)
        private readonly culturalContentRepository: Repository<CulturalContent>,
    ) { }

    async create(createCulturalContentDto: CreateCulturalContentDto): Promise<CulturalContent> {
        const content = this.culturalContentRepository.create(createCulturalContentDto);
        return await this.culturalContentRepository.save(content);
    }

    async findAll({ skip = 0, take = 10 }: { skip?: number; take?: number } = {}): Promise<CulturalContent[]> {
        return await this.culturalContentRepository.find({ skip, take });
    }

    async findOne(id: string): Promise<CulturalContent> {
        const content = await this.culturalContentRepository.findOne({
            where: { id }
        });

        if (!content) {
            throw new NotFoundException(`Contenido cultural con ID ${id} no encontrado`);
        }

        return content;
    }

    async findByCategory(category: string): Promise<CulturalContent[]> {
        return await this.culturalContentRepository.find({
            where: { category }
        });
    }

    async update(id: string, updateCulturalContentDto: UpdateCulturalContentDto): Promise<CulturalContent> {
        const content = await this.findOne(id);

        const updatedContent = Object.assign(content, updateCulturalContentDto);
        return await this.culturalContentRepository.save(updatedContent);
    }

    async remove(id: string): Promise<void> {
        const content = await this.findOne(id);
        await this.culturalContentRepository.remove(content);
    }
}
