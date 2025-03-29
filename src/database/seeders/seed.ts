import { config } from 'dotenv';
import { DataSource } from 'typeorm';
import { Activity, ActivityType, DifficultyLevel } from '../../features/activity/entities/activity.entity';
import { Topic } from '../../features/topic/entities/topic.entity';
import { Vocabulary } from '../../features/vocabulary/entities/vocabulary.entity';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  entities: [Activity, Topic, Vocabulary],
  synchronize: false,
  ssl: process.env.DB_SSL === 'true',
});

AppDataSource.initialize()
  .then(async () => {
    console.log('Database connection initialized');

    // Crear tema
    const topicRepository = AppDataSource.getRepository(Topic);
    const familyTopic = await topicRepository.save({
      name: 'Familia',
      description: 'Vocabulario relacionado con la familia en Kamëntsá',
    });

    // Crear actividad
    const activityRepository = AppDataSource.getRepository(Activity);
    const familyActivity = await activityRepository.save({
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

    // Crear vocabulario
    const vocabularyRepository = AppDataSource.getRepository(Vocabulary);
    const familyVocabulary = await vocabularyRepository.save([
      {
        wordKamentsa: 'bebmá',
        wordSpanish: 'madre',
        pronunciation: 'beb-má',
        culturalContext: 'En la cultura Kamëntsá, la madre (bebmá) es una figura central que transmite la sabiduría y las tradiciones.',
        category: 'sustantivo',
        difficultyLevel: 1,
        topic: familyTopic,
      },
      {
        wordKamentsa: 'taitá',
        wordSpanish: 'padre',
        pronunciation: 'tai-tá',
        culturalContext: 'El padre (taitá) en la cultura Kamëntsá es el guía espiritual y protector de la familia.',
        category: 'sustantivo',
        difficultyLevel: 1,
        topic: familyTopic,
      },
      {
        wordKamentsa: 'bebém',
        wordSpanish: 'hijo/hija',
        pronunciation: 'be-bém',
        culturalContext: 'Los hijos (bebém) son considerados una bendición y la continuación de las tradiciones.',
        category: 'sustantivo',
        difficultyLevel: 1,
        topic: familyTopic,
      },
    ]);

    console.log('Topic created:', familyTopic);
    console.log('Activity created:', familyActivity);
    console.log('Vocabulary created:', familyVocabulary);
    console.log('Seeding completed successfully!');

    process.exit(0);
  })
  .catch((error) => {
    console.error('Error during seeding:', error);
    process.exit(1);
  }); 