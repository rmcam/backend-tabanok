import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';
import { Vocabulary } from './entities/vocabulary.entity';

@Injectable()
export class VocabularyService {
    constructor(
        @InjectRepository(Vocabulary)
        private readonly vocabularyRepository: Repository<Vocabulary>,
    ) { }

    async create(createVocabularyDto: CreateVocabularyDto): Promise<Vocabulary> {
        const vocabulary = this.vocabularyRepository.create(createVocabularyDto);
        return await this.vocabularyRepository.save(vocabulary);
    }

    async findAll(): Promise<Vocabulary[]> {
        return await this.vocabularyRepository.find({
            where: { isActive: true },
            relations: ['topic'],
        });
    }

    async findOne(id: string): Promise<Vocabulary> {
        const vocabulary = await this.vocabularyRepository.findOne({
            where: { id, isActive: true },
            relations: ['topic'],
        });

        if (!vocabulary) {
            throw new NotFoundException(`Vocabulario con ID ${id} no encontrado`);
        }

        return vocabulary;
    }

    async findByTopic(topicId: string): Promise<Vocabulary[]> {
        return await this.vocabularyRepository.find({
            where: {
                topic: { id: topicId },
                isActive: true
            },
            relations: ['topic']
        });
    }

    async update(id: string, updateVocabularyDto: UpdateVocabularyDto): Promise<Vocabulary> {
        const vocabulary = await this.findOne(id);
        Object.assign(vocabulary, updateVocabularyDto);
        return await this.vocabularyRepository.save(vocabulary);
    }

    async remove(id: string): Promise<void> {
        const vocabulary = await this.findOne(id);
        vocabulary.isActive = false;
        await this.vocabularyRepository.save(vocabulary);
    }
} 