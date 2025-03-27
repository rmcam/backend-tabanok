import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from '../topic/entities/topic.entity';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';
import { Vocabulary } from './entities/vocabulary.entity';

@Injectable()
export class VocabularyService {
  constructor(
    @InjectRepository(Vocabulary)
    private readonly vocabularyRepository: Repository<Vocabulary>,
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
  ) {}

  async create(createVocabularyDto: CreateVocabularyDto): Promise<Vocabulary> {
    const topic = await this.topicRepository.findOne({
      where: { id: createVocabularyDto.topicId },
    });

    if (!topic) {
      throw new NotFoundException(`Topic with ID ${createVocabularyDto.topicId} not found`);
    }

    const vocabulary = this.vocabularyRepository.create({
      ...createVocabularyDto,
      topic,
    });

    return this.vocabularyRepository.save(vocabulary);
  }

  async findAll(): Promise<Vocabulary[]> {
    return this.vocabularyRepository.find({
      relations: ['topic'],
    });
  }

  async findOne(id: string): Promise<Vocabulary> {
    const vocabulary = await this.vocabularyRepository.findOne({
      where: { id },
      relations: ['topic'],
    });

    if (!vocabulary) {
      throw new NotFoundException(`Vocabulary with ID ${id} not found`);
    }

    return vocabulary;
  }

  async findByTopic(topicId: string): Promise<Vocabulary[]> {
    return this.vocabularyRepository.find({
      where: { topic: { id: topicId } },
      relations: ['topic'],
    });
  }

  async findByDifficultyLevel(level: number): Promise<Vocabulary[]> {
    return this.vocabularyRepository.find({
      where: { difficultyLevel: level },
      relations: ['topic'],
    });
  }

  async findByCategory(category: string): Promise<Vocabulary[]> {
    return this.vocabularyRepository.find({
      where: { category },
      relations: ['topic'],
    });
  }

  async search(term: string): Promise<Vocabulary[]> {
    return this.vocabularyRepository
      .createQueryBuilder('vocabulary')
      .leftJoinAndSelect('vocabulary.topic', 'topic')
      .where('vocabulary.wordKamentsa ILIKE :term', { term: `%${term}%` })
      .orWhere('vocabulary.wordSpanish ILIKE :term', { term: `%${term}%` })
      .getMany();
  }

  async update(id: string, updateVocabularyDto: UpdateVocabularyDto): Promise<Vocabulary> {
    const vocabulary = await this.findOne(id);

    if (updateVocabularyDto.topicId) {
      const topic = await this.topicRepository.findOne({
        where: { id: updateVocabularyDto.topicId },
      });

      if (!topic) {
        throw new NotFoundException(`Topic with ID ${updateVocabularyDto.topicId} not found`);
      }

      vocabulary.topic = topic;
    }

    Object.assign(vocabulary, updateVocabularyDto);
    return this.vocabularyRepository.save(vocabulary);
  }

  async remove(id: string): Promise<void> {
    const vocabulary = await this.findOne(id);
    await this.vocabularyRepository.remove(vocabulary);
  }

  async getRandomVocabulary(limit: number = 5): Promise<Vocabulary[]> {
    return this.vocabularyRepository
      .createQueryBuilder('vocabulary')
      .leftJoinAndSelect('vocabulary.topic', 'topic')
      .orderBy('RANDOM()')
      .take(limit)
      .getMany();
  }
} 