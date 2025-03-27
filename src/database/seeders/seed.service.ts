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
    private readonly vocabularyRepository: Repository<Vocabulary>,
  ) { }

  async seed() {
    await this.seedUnities();
    await this.seedTopics();
    await this.seedVocabulary();
  }

  private async seedUnities() {
    const unities = [
      {
        name: 'Unidad 1: Saludos y presentaciones',
        description: 'Aprende a saludar y presentarte en Kamentsa',
        order: 1,
      },
      // ... más unidades
    ];

    for (const unityData of unities) {
      const existingUnity = await this.unityRepository.findOne({
        where: { name: unityData.name },
      });

      if (!existingUnity) {
        await this.unityRepository.save(unityData);
      }
    }
  }

  private async seedTopics() {
    const unity = await this.unityRepository.findOne({
      where: { order: 1 },
    });

    if (!unity) return;

    const topics = [
      {
        name: 'Saludos básicos',
        description: 'Vocabulario básico para saludar',
        order: 1,
        unityId: unity.id,
      },
      // ... más temas
    ];

    for (const topicData of topics) {
      const existingTopic = await this.topicRepository.findOne({
        where: { name: topicData.name },
      });

      if (!existingTopic) {
        await this.topicRepository.save(topicData);
      }
    }
  }

  private async seedVocabulary() {
    const topic = await this.topicRepository.findOne({
      where: { order: 1 },
    });

    if (!topic) return;

    const vocabulary = [
      {
        wordSpanish: 'hola',
        wordKamentsa: 'aiñe',
        pronunciation: 'ai-ñe',
        example: 'Aiñe, ¿chka ichmëna?',
        exampleTranslation: 'Hola, ¿cómo estás?',
        description: 'Saludo informal',
        audioUrl: 'https://example.com/audio/hola.mp3',
        imageUrl: 'https://example.com/images/hola.jpg',
        topicId: topic.id,
      },
      // ... más vocabulario
    ];

    for (const vocabData of vocabulary) {
      const existingVocab = await this.vocabularyRepository.findOne({
        where: {
          wordSpanish: vocabData.wordSpanish,
          topicId: vocabData.topicId,
        },
      });

      if (!existingVocab) {
        await this.vocabularyRepository.save(vocabData);
      }
    }
  }
} 