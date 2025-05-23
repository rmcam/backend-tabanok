import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';
import { Vocabulary } from './entities/vocabulary.entity';
import { PaginatedResponse } from '../../common/interfaces/paginated-response.interface';

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

    async search(q: string, page = 1, limit = 20, tipo?: string, topicId?: string): Promise<PaginatedResponse<Vocabulary>> {
        console.log(`[VocabularyService] search called with q="${q}", page=${page}, limit=${limit}, tipo="${tipo}", topicId="${topicId}"`);
        const query = this.vocabularyRepository
            .createQueryBuilder('vocabulary')
            .leftJoinAndSelect('vocabulary.topic', 'topic')
            .where('vocabulary.isActive = true');

        if (q) {
            query.andWhere(
                '(vocabulary.wordKamentsa ILIKE :q OR vocabulary.wordSpanish ILIKE :q)',
                { q: `%${q}%` }
            );
        }

        if (tipo) {
            query.andWhere('vocabulary.description ILIKE :tipo', { tipo: `%${tipo}%` });
        }

        if (topicId) {
            query.andWhere('topic.id = :topicId', { topicId });
        }

        const [results, total] = await query
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();

        const totalPages = Math.ceil(total / limit);

        console.log(`[VocabularyService] search returned ${results.length} results.`);
        return {
            items: results,
            total,
            page,
            limit,
            totalPages,
        };
    }

    async findAll(): Promise<Vocabulary[]> {
        console.log('[VocabularyService] findAll called');
        const results = await this.vocabularyRepository.find({
            where: { isActive: true },
            relations: ['topic'],
        });
        console.log(`[VocabularyService] findAll returned ${results.length} results.`);
        return results;
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
