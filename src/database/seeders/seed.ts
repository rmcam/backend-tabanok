import { config } from 'dotenv';
import { DataSource, Repository } from 'typeorm';
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
import { LeaderboardType, LeaderboardCategory } from '../../features/gamification/enums/leaderboard.enum'; // Corregir ruta de importación
import { Reward } from '../../features/reward/entities/reward.entity';
import { Vocabulary } from '../../features/vocabulary/entities/vocabulary.entity';
import { Multimedia } from '../../features/multimedia/entities/multimedia.entity';
import { Statistics } from '../../features/statistics/entities/statistics.entity';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Activity, Topic, Unity, Lesson, Exercise, Progress, User, Account, UserReward, UserAchievement, Achievement, Leaderboard, Reward, Vocabulary, Multimedia, Statistics],
  synchronize: true,
  ssl: process.env.DB_SSL === 'true' || process.env.DATABASE_URL?.includes('render.com'),
});

AppDataSource.initialize()
  .then(async () => {
    console.log('Database connection initialized');

    // Obtener todos los repositorios necesarios
    const userRepository: Repository<User> = AppDataSource.getRepository(User);
    const accountRepository: Repository<Account> = AppDataSource.getRepository(Account);
    const unityRepository: Repository<Unity> = AppDataSource.getRepository(Unity);
    const topicRepository: Repository<Topic> = AppDataSource.getRepository(Topic);
    const vocabularyRepository: Repository<Vocabulary> = AppDataSource.getRepository(Vocabulary);
    const lessonRepository: Repository<Lesson> = AppDataSource.getRepository(Lesson);
    const exerciseRepository: Repository<Exercise> = AppDataSource.getRepository(Exercise);
    const progressRepository: Repository<Progress> = AppDataSource.getRepository(Progress);
    const userRewardRepository: Repository<UserReward> = AppDataSource.getRepository(UserReward);
    const userAchievementRepository: Repository<UserAchievement> = AppDataSource.getRepository(UserAchievement);
    const achievementRepository: Repository<Achievement> = AppDataSource.getRepository(Achievement);
    const leaderboardRepository: Repository<Leaderboard> = AppDataSource.getRepository(Leaderboard);
    const activityRepository: Repository<Activity> = AppDataSource.getRepository(Activity);
    const rewardRepository: Repository<Reward> = AppDataSource.getRepository(Reward);
    const multimediaRepository: Repository<Multimedia> = AppDataSource.getRepository(Multimedia);
    const statisticsRepository: Repository<Statistics> = AppDataSource.getRepository(Statistics);


    // Eliminar datos existentes en orden de dependencia inversa
    console.log('Eliminando datos existentes...');
    await progressRepository.delete({});
    await userRewardRepository.delete({});
    await userAchievementRepository.delete({});
    await leaderboardRepository.delete({});
    await statisticsRepository.delete({});
    await exerciseRepository.delete({});
    await multimediaRepository.delete({});
    await lessonRepository.delete({});
    await vocabularyRepository.delete({});
    await activityRepository.delete({});
    await topicRepository.delete({});
    await unityRepository.delete({});
    await accountRepository.delete({});
    await userRepository.delete({});
    await achievementRepository.delete({});
    await rewardRepository.delete({});
    console.log('Datos existentes eliminados.');


    // Crear usuario base
    const user = await userRepository.save({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password',
      firstName: 'Test',
      lastName: 'User',
      languages: [],
      preferences: {
        notifications: true,
        language: 'es',
        theme: 'light',
      },
    });

    // Crear unidad base
    const unity = await unityRepository.save({
      title: 'Unidad 1',
      description: 'Unidad introductoria',
      order: 1,
      isLocked: false,
      requiredPoints: 0,
      isActive: true,
      user: user,
      userId: user.id,
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
    const exampleActivity = await activityRepository.save({
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
    const dictPath = path.resolve(__dirname, '../json/consolidated_dictionary.json');
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

    // Crear datos de ejemplo para Achievement
    const achievements = await achievementRepository.save([
      { name: 'Primer Inicio de Sesión', description: 'Inicia sesión por primera vez', points: 10, criteria: '' },
      { name: 'Lección Completada', description: 'Completa tu primera lección', points: 20, criteria: '' },
      { name: 'Maestro del Vocabulario', description: 'Aprende 50 palabras nuevas', points: 50, criteria: '' },
    ]);

    // Crear datos de ejemplo para Reward
    const rewards = await rewardRepository.save([
      { name: 'Puntos Extra', title: 'Puntos Extra', description: 'Recibe 100 puntos adicionales', points: 100 },
      { name: 'Avatar Desbloqueado', title: 'Avatar Desbloqueado', description: 'Desbloquea un nuevo avatar', points: 0 }, // Assuming some rewards give no points directly
    ]);

    // Crear datos de ejemplo para Lesson (depende de Topic)
    // Usamos el familyTopic creado anteriormente
    const lesson1 = await lessonRepository.save({
      title: 'Introducción a la Familia',
      description: 'Aprende los miembros básicos de la familia',
      order: 1,
      isLocked: false,
      requiredPoints: 0,
      isActive: true,
      topic: familyTopic,
      unity: unity, // Asociar la lección con la unidad base
    });

    // Crear datos de ejemplo para Exercise (depende de Lesson)
    const exercise1 = await exerciseRepository.save({
      title: 'Ejercicio de Familia',
      description: 'Practica el vocabulario de la familia',
      type: 'quiz', // Assuming a type property exists
      content: { questions: [{ question: '...', options: ['...'], correctAnswer: '...' }] }, // Placeholder content
      difficulty: DifficultyLevel.BEGINNER, // Añadir dificultad
      points: 15, // Añadir puntos
      timeLimit: 180,
      lesson: lesson1,
      topicId: familyTopic.id, // Añadir topicId
    });

    // Crear datos de ejemplo para Progress (depende de User, Lesson, Activity, Exercise)
    // Usamos el 'user', 'lesson1', y la 'activity' creada anteriormente
    await progressRepository.save([
      {
        user: user,
        lesson: lesson1,
        isCompleted: true,
        score: 85,
        completionDate: new Date(),
      },
      // Example progress for the existing activity
      {
        user: user,
        activity: exampleActivity,
        isCompleted: true,
        score: 90,
        completionDate: new Date(),
      },
      // Example progress for the new exercise
      {
        user: user,
        exercise: exercise1,
        isCompleted: false, // Not completed yet
        score: 0,
        completionDate: null,
      },
    ]);

    // Crear datos de ejemplo para UserAchievement (depende de User, Achievement)
    // Usamos el 'user' y los 'achievements' creados
    await userAchievementRepository.save([
      {
        user: user,
        achievement: achievements[0], // Primer Inicio de Sesión
        dateAwarded: new Date(), // Cambiar unlockedAt a dateAwarded
      },
    ]);

    // Crear datos de ejemplo para UserReward (depende de User, Reward)
    // Usamos el 'user' y los 'rewards' creados
    await userRewardRepository.save([
      {
        user: user, // Usar objeto user
        reward: rewards[0], // Usar objeto reward
        dateAwarded: new Date(),
      },
    ]);

    // Crear datos de ejemplo para Leaderboard (depende de User, y conceptualmente de puntos/progreso)
    // Se podría poblar con el usuario base y sus puntos (si se calculan)
    // Por simplicidad, solo añadiremos el usuario base con puntos de ejemplo
    await leaderboardRepository.save([
      {
        type: LeaderboardType.DAILY, // Añadir tipo
        category: LeaderboardCategory.POINTS, // Añadir categoría
        startDate: new Date(),
        endDate: new Date(),
        rankings: [],
        rewards: [], // Añadir rewards (array vacío por defecto)
        user: user, // Usar objeto user
        lastUpdated: new Date(),
      },
    ]);

    // Crear datos de ejemplo para Statistics (depende de User)
    await statisticsRepository.save({
      user: user,
      userId: user.id,
      categoryMetrics: {},
      strengthAreas: [],
      improvementAreas: [],
      learningMetrics: {
        totalLessonsCompleted: 0,
        totalExercisesCompleted: 0,
        averageScore: 0,
        totalTimeSpentMinutes: 0,
        longestStreak: 0,
        currentStreak: 0,
        lastActivityDate: null,
        totalMasteryScore: 0,
      },
      weeklyProgress: [],
      monthlyProgress: [],
      periodicProgress: [],
      achievementStats: {
        totalAchievements: 0,
        achievementsByCategory: {},
        lastAchievementDate: new Date().toISOString(),
        specialAchievements: [],
      },
      badgeStats: {
        totalBadges: 0,
        badgesByTier: {},
        lastBadgeDate: new Date().toISOString(),
        activeBadges: [],
      },
      learningPath: {
        currentLevel: 1,
        recommendedCategories: [],
        nextMilestones: [],
        customGoals: [],
      },
    });

    console.log('Seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error during seeding:', error);
    process.exit(1);
  });
