import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Activity } from '../../features/activity/entities/activity.entity';
import { Topic } from '../../features/topic/entities/topic.entity';
import { Vocabulary } from '../../features/vocabulary/entities/vocabulary.entity';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Vocabulary)
    private readonly vocabularyRepository: Repository<Vocabulary>,
  ) {}

  async seedTopics() {
    const topics = [
      {
        name: 'Familia',
        description: 'Vocabulario relacionado con la familia y relaciones familiares',
      },
      {
        name: 'Saludos',
        description: 'Saludos y expresiones comunes en Kamëntsá',
      },
      {
        name: 'Números',
        description: 'Números y conteo en Kamëntsá',
      },
      {
        name: 'Colores',
        description: 'Colores y su significado cultural',
      },
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

  async seedVocabulary() {
    // Primero aseguramos que existan los temas
    await this.seedTopics();

    // Obtenemos los temas creados
    const familyTopic = await this.topicRepository.findOne({
      where: { name: 'Familia' },
    });
    const greetingsTopic = await this.topicRepository.findOne({
      where: { name: 'Saludos' },
    });

    const vocabulary = [
      {
        wordKamentsa: 'Bëtsa',
        wordSpanish: 'Hermano',
        pronunciation: 'Bet-sa',
        culturalContext: 'Término usado para referirse al hermano en la comunidad Kamëntsá',
        category: 'familia',
        difficultyLevel: 1,
        examples: ['Ats bëtsa endmën', 'Mi hermano está aquí'],
        topic: familyTopic,
      },
      {
        wordKamentsa: 'Bebmá',
        wordSpanish: 'Madre',
        pronunciation: 'Beb-má',
        culturalContext: 'Término de respeto usado para referirse a la madre',
        category: 'familia',
        difficultyLevel: 1,
        examples: ['Bebmá tojashjango', 'Madre ha llegado'],
        topic: familyTopic,
      },
      {
        wordKamentsa: 'Bëngbe',
        wordSpanish: 'Hola',
        pronunciation: 'Beng-be',
        culturalContext: 'Saludo tradicional Kamëntsá que significa "nuestro"',
        category: 'saludo',
        difficultyLevel: 1,
        examples: ['Bëngbe botamán', 'Buen día'],
        topic: greetingsTopic,
      },
    ];

    for (const vocabData of vocabulary) {
      const existingVocab = await this.vocabularyRepository.findOne({
        where: {
          wordKamentsa: vocabData.wordKamentsa,
          topic: { id: vocabData.topic.id },
        },
      });

      if (!existingVocab) {
        await this.vocabularyRepository.save(vocabData);
      }
    }
  }

  async seedAll() {
    await this.seedTopics();
    await this.seedVocabulary();
  }
} 