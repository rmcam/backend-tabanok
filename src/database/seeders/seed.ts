import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import {
  Activity,
  ActivityType,
  DifficultyLevel,
} from '../../features/activity/entities/activity.entity';
import { Topic } from '../../features/topic/entities/topic.entity';
import { Unity } from '../../features/unity/entities/unity.entity';
import { Lesson } from '../../features/lesson/entities/lesson.entity';
import { Exercise } from '../../features/exercises/entities/exercise.entity';
import { Progress } from '../../features/progress/entities/progress.entity';
import { User } from '../../auth/entities/user.entity';
import { Account } from '../../features/account/entities/account.entity';
import { UserReward } from '../../features/gamification/entities/user-reward.entity';
import { UserAchievement } from '../../features/gamification/entities/user-achievement.entity';
import { Achievement } from '../../features/gamification/entities/achievement.entity';
import { Leaderboard } from '../../features/gamification/entities/leaderboard.entity';
import { Reward } from '../../features/reward/entities/reward.entity';
import { Vocabulary } from '../../features/vocabulary/entities/vocabulary.entity';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Activity, Topic, Unity, Lesson, Exercise, Progress, User, Account, UserReward, UserAchievement, Achievement, Leaderboard, Reward, Vocabulary],
  synchronize: true,
  ssl: process.env.DB_SSL === 'true',
});

AppDataSource.initialize()
  .then(async () => {
    console.log('Database connection initialized');

    const unityRepository = AppDataSource.getRepository(Unity);
    const topicRepository = AppDataSource.getRepository(Topic);
    const vocabularyRepository = AppDataSource.getRepository(Vocabulary);

    // Crear unidad base
    const unity = await unityRepository.save({
      title: 'Unidad 1',
      description: 'Unidad introductoria',
      order: 1,
      isLocked: false,
      requiredPoints: 0,
      isActive: true,
    });

    // Crear tema Familia
    const familyTopic = await topicRepository.save({
      title: 'Familia',
      description: 'Vocabulario relacionado con la familia en Kamëntsá',
      order: 1,
      isLocked: false,
      requiredPoints: 0,
      isActive: true,
      unity: unity,
      unityId: unity.id,
    });

    // Crear actividad ejemplo
    const activityRepository = AppDataSource.getRepository(Activity);
    await activityRepository.save({
      title: 'Aprende palabras de la familia',
      type: ActivityType.INTERACTIVE,
      difficultyLevel: DifficultyLevel.BEGINNER,
      content: {
        questions: [
          {
            question: '¿Cómo se dice "madre" en Kamëntsá?',
            options: ['bebmá', 'taitá', 'bebém'],
            correctAnswer: 'bebmá',
            points: 10,
          },
          {
            question: '¿Cómo se dice "padre" en Kamëntsá?',
            options: ['taitá', 'bebmá', 'bebém'],
            correctAnswer: 'taitá',
            points: 10,
          },
        ],
        timeLimit: 300,
        minScore: 70,
        maxAttempts: 3,
      },
      totalPoints: 20,
      timeLimit: 300,
      minScoreToPass: 70,
      maxAttempts: 3,
      topic: familyTopic,
    });

    // Crear tema para el diccionario Kamëntsá
    const dictionaryTopic = await topicRepository.save({
      title: 'Diccionario Kamëntsá',
      description: 'Palabras del diccionario bilingüe Kamëntsá-Español',
      order: 2,
      isLocked: false,
      requiredPoints: 0,
      isActive: true,
      unity: unity,
      unityId: unity.id,
    });

    // Leer el diccionario consolidado
    const dictPath = path.resolve(__dirname, '../../../files/json/consolidated_dictionary.json');
    console.log('Ruta del diccionario:', dictPath);

    if (!fs.existsSync(dictPath)) {
      console.error('El archivo del diccionario no existe en la ruta:', dictPath);
      process.exit(1);
    }

    const dictRaw = fs.readFileSync(dictPath, 'utf-8');
    console.log('Tamaño del archivo JSON:', dictRaw.length, 'bytes');

    const dictJson = JSON.parse(dictRaw);

    const entries = dictJson.diccionario?.content?.kamensta_espanol || [];
    if (!entries.length && dictJson.sections?.diccionario?.content?.kamensta_espanol) {
      console.log('Intentando ruta alternativa en sections.diccionario.content.kamensta_espanol');
      entries.push(...dictJson.sections.diccionario.content.kamensta_espanol);
    }
    console.log(`Importando ${entries.length} entradas del diccionario...`);

    const vocabItems = entries.map((entry: any) => {
      const significado = entry.significados?.[0] || entry.equivalentes?.[0] || {};
      const definicion = significado.definicion || '';
      const ejemplo = significado.ejemplo || '';
      return {
        word: entry.entrada,
        translation: definicion,
        description: ejemplo,
        example: ejemplo,
        audioUrl: '',
        imageUrl: '',
        points: 0,
        isActive: true,
        topic: dictionaryTopic,
      };
    });

    await vocabularyRepository.save(vocabItems);

    console.log('Diccionario Kamëntsá importado correctamente con', vocabItems.length, 'palabras.');

    console.log('Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error during seeding:', error);
    process.exit(1);
  });
