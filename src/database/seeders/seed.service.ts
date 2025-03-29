import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from '../../features/topic/entities/topic.entity';
import { Unity } from '../../features/unity/entities/unity.entity';
import { Vocabulary } from '../../features/vocabulary/entities/vocabulary.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Unity)
    private readonly unityRepository: Repository<Unity>,
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    @InjectRepository(Vocabulary)
    private readonly vocabularyRepository: Repository<Vocabulary>
  ) { }

  async seed() {
    await this.seedInitialUnities();
    await this.seedInitialTopics();
    await this.seedInitialVocabulary();
  }

  private async seedInitialUnities() {
    const unities = [
      {
        title: 'Unidad 1: Saludos y presentaciones',
        description: 'Aprende a saludar y presentarte en Kamentsa',
        order: 1,
      },
      // ... más unidades
    ];

    for (const unityData of unities) {
      await this.seedUnity(unityData);
    }
  }

  private async seedInitialTopics() {
    const unity = await this.unityRepository.findOne({
      where: { order: 1 }
    });

    if (!unity) return;

    const topics = [
      {
        title: 'Saludos básicos',
        description: 'Vocabulario básico para saludar',
        order: 1,
        unity: unity
      },
      // ... más temas
    ];

    for (const topicData of topics) {
      await this.seedTopic(topicData);
    }
  }

  private async seedInitialVocabulary() {
    const topic = await this.topicRepository.findOne({
      where: { order: 1 }
    });

    if (!topic) return;

    const vocabulary = [
      {
        word: 'aiñe',
        translation: 'hola',
        description: 'Saludo informal',
        example: 'Aiñe, ¿chka ichmëna?',
        audioUrl: 'https://example.com/audio/hola.mp3',
        imageUrl: 'https://example.com/images/hola.jpg',
        topic: topic
      },
      // ... más vocabulario
    ];

    for (const vocabData of vocabulary) {
      await this.seedVocabulary(vocabData);
    }
  }

  async seedUnity(unityData: Partial<Unity>): Promise<Unity> {
    const existingUnity = await this.unityRepository.findOne({
      where: { title: unityData.title }
    });

    if (existingUnity) {
      return existingUnity;
    }

    const unity = this.unityRepository.create(unityData);
    return await this.unityRepository.save(unity);
  }

  async seedTopic(topicData: Partial<Topic>): Promise<Topic> {
    const existingTopic = await this.topicRepository.findOne({
      where: { title: topicData.title }
    });

    if (existingTopic) {
      return existingTopic;
    }

    const topic = this.topicRepository.create(topicData);
    return await this.topicRepository.save(topic);
  }

  async seedVocabulary(vocabData: Partial<Vocabulary>): Promise<Vocabulary> {
    const existingVocab = await this.vocabularyRepository.findOne({
      where: {
        word: vocabData.word,
        topic: vocabData.topic
      }
    });

    if (existingVocab) {
      return existingVocab;
    }

    const vocabulary = this.vocabularyRepository.create(vocabData);
    return await this.vocabularyRepository.save(vocabulary);
  }
} 