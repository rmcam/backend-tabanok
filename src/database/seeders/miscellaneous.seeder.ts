import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../../auth/entities/user.entity";
import { Activity, ActivityType, DifficultyLevel } from "../../features/activity/entities/activity.entity";
import { Comment } from "../../features/comments/entities/comment.entity";
import { Content } from "../../features/content/entities/content.entity";
import { ContentVersion } from "../../features/content-versioning/entities/content-version.entity";
import { Exercise } from "../../features/exercises/entities/exercise.entity";
import { Lesson } from "../../features/lesson/entities/lesson.entity";
import { Multimedia } from "../../features/multimedia/entities/multimedia.entity";
import { Topic } from '../../features/topic/entities/topic.entity';
import { Notification } from "../../features/notifications/entities/notification.entity";
import { Progress } from "../../features/progress/entities/progress.entity";
import { Tag } from "../../features/statistics/entities/statistics-tag.entity";
import { Statistics } from "../../features/statistics/entities/statistics.entity";
import { CategoryType, CategoryDifficulty, CategoryStatus } from "../../features/statistics/types/category.enum";
import { WebhookSubscription } from "../../features/webhooks/entities/webhook-subscription.entity";

@Injectable()
export class MiscellaneousSeeder {
  constructor(
    @InjectRepository(Activity)
    private readonly activityRepository: Repository<Activity>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>,
    @InjectRepository(Multimedia)
    private readonly multimediaRepository: Repository<Multimedia>,
    @InjectRepository(Notification)
    private readonly notificationRepository: Repository<Notification>,
    @InjectRepository(Progress)
    private readonly progressRepository: Repository<Progress>,
    @InjectRepository(Tag)
    private readonly statisticsTagRepository: Repository<Tag>,
    @InjectRepository(Statistics)
    private readonly statisticsRepository: Repository<Statistics>,
    @InjectRepository(WebhookSubscription)
    private readonly webhookSubscriptionRepository: Repository<WebhookSubscription>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
    @InjectRepository(ContentVersion)
    private readonly contentVersionRepository: Repository<ContentVersion>
  ) {}

  async seed() {
    console.log("Starting Miscellaneous seeding...");
    // Implement seeding logic for miscellaneous entities here
    // This will require fetching existing Users, Content, Lessons, etc.

    await this.seedActivities();
    await this.seedComments();
    await this.seedExercises();
    await this.seedMultimedia();
    await this.seedProgress();
    await this.seedStatistics();

    console.log("Miscellaneous seeding completed.");
  }

  private async seedActivities() {
    console.log("Seeding Activities...");
    const activitiesData = [
      {
        title: "Quiz de Saludos",
        type: ActivityType.INTERACTIVE, // Usar el enum
        difficulty: DifficultyLevel.BEGINNER, // Usar el enum
        content: {
          questions: [
            {
              question: "¿Cómo saludas informalmente?",
              options: ["Aiñe", "Buenas tardes"],
              correctAnswer: "Aiñe",
              points: 10,
            },
            {
              question: '¿Qué significa "chka ichmëna"?',
              options: ["¿Cómo estás?", "Adiós"],
              correctAnswer: "¿Cómo estás?",
              points: 10,
            },
          ],
        },
        points: 20,
      },
      {
        title: "Juego de Memoria Familiar",
        type: ActivityType.INTERACTIVE, // Usar el enum
        difficulty: DifficultyLevel.BEGINNER, // Usar el enum
        content: {
          pairs: [
            { image: "http://example.com/img/madre.jpg", word: "bebmá" },
            { image: "http://example.com/img/padre.jpg", word: "taitá" },
          ],
        },
        points: 30,
      },
      {
        title: "Identifica los Colores",
        type: ActivityType.INTERACTIVE, // Usar el enum
        difficulty: DifficultyLevel.BEGINNER, // Usar el enum
        content: {
          questions: [
            {
              question: '¿Qué color es "ñá"?',
              options: ["Rojo", "Azul"],
              correctAnswer: "Rojo",
              points: 10,
            },
          ],
        },
        points: 10,
      },
    ];

    for (const activityData of activitiesData) {
      const existingActivity = await this.activityRepository.findOne({
        where: { title: activityData.title },
      });

      if (!existingActivity) {
        const activity = this.activityRepository.create(activityData);
        await this.activityRepository.save(activity);
        console.log(`Activity "${activity.title}" created.`);
      } else {
        console.log(`Activity "${existingActivity.title}" already exists.`);
      }
    }
    console.log("Activities seeded.");
  }

  private async seedComments() {
    console.log("Seeding Comments...");
    // Comments are linked to ContentVersion
    // Requires fetching existing ContentVersions

    // Fetch some existing ContentVersions to link comments to
    const contentVersions = await this.contentVersionRepository.find({ take: 2 }); // Get a couple of versions

    if (contentVersions.length === 0) {
        console.warn('No ContentVersions found to link comments. Skipping comment seeding.');
        return;
    }

    const comment1Data = {
        content: "Este es un comentario de ejemplo sobre la versión 1.",
        author: "Usuario Ejemplo 1",
        versionId: contentVersions[0].id,
        metadata: { type: 'general' as const } // Use 'as const' for literal type
    };

    const comment2Data = {
        content: "Este es otro comentario sobre la versión 1.",
        author: "Usuario Ejemplo 2",
        versionId: contentVersions[0].id,
        metadata: { type: 'review' as const, context: { lineNumber: 15, selection: 'algún texto' } } // Use 'as const' for literal type
    };

    const comment3Data = {
        content: "Este es un comentario sobre la versión 2.",
        author: "Usuario Ejemplo 3",
        versionId: contentVersions[1].id,
        metadata: { type: 'technical' as const } // Use 'as const' for literal type
    };

    // Check if comments already exist to avoid duplicates
    const existingComment1 = await this.commentRepository.findOne({ where: { content: comment1Data.content, versionId: comment1Data.versionId } });
    const existingComment2 = await this.commentRepository.findOne({ where: { content: comment2Data.content, versionId: comment2Data.versionId } });
    const existingComment3 = await this.commentRepository.findOne({ where: { content: comment3Data.content, versionId: comment3Data.versionId } });


    let comment1 = existingComment1;
    if (!existingComment1) {
        comment1 = this.commentRepository.create(comment1Data);
        await this.commentRepository.save(comment1);
        console.log(`Comment "${comment1.content}" created.`);
    } else {
        console.log(`Comment "${existingComment1.content}" already exists.`);
    }

    if (!existingComment2) {
        const comment2 = this.commentRepository.create(comment2Data);
        await this.commentRepository.save(comment2);
        console.log(`Comment "${comment2.content}" created.`);
    } else {
        console.log(`Comment "${existingComment2.content}" already exists.`);
    }

     if (!existingComment3) {
        const comment3 = this.commentRepository.create(comment3Data);
        await this.commentRepository.save(comment3);
        console.log(`Comment "${comment3.content}" created.`);
    } else {
        console.log(`Comment "${existingComment3.content}" already exists.`);
    }


    // Seed a reply to comment1
    if (comment1) { // Only seed reply if comment1 was created or found
        const replyCommentData = {
            content: "Esta es una respuesta al comentario 1.",
            author: "Usuario Respuesta 1",
            versionId: comment1.versionId, // Reply is on the same version as the parent
            parentId: comment1.id,
            metadata: { type: 'general' as const } // Use 'as const' for literal type
        };

        const existingReply = await this.commentRepository.findOne({ where: { content: replyCommentData.content, parentId: replyCommentData.parentId } });

        if (!existingReply) {
            const replyComment = this.commentRepository.create(replyCommentData);
            await this.commentRepository.save(replyComment);
            console.log(`Reply comment "${replyComment.content}" created.`);
        } else {
            console.log(`Reply comment "${existingReply.content}" already exists.`);
        }
    }

    console.log("Comments seeded.");
  }

  private async seedExercises() {
    console.log('Seeding Exercises...');
    // Requires fetching Lessons and Topics to link exercises
    const lessons = await this.lessonRepository.find(); // Fetch all existing lessons
    const topics = await this.topicRepository.find(); // Fetch all existing topics

    if (lessons.length === 0) {
      console.log('No lessons found to link exercises. Skipping exercise seeding.');
      return;
    }
     if (topics.length === 0) {
      console.log('No topics found to link exercises. Skipping exercise seeding.');
      return;
    }

    // Obtener lecciones y temas específicos por título
    const lesson1_1 = lessons.find(lesson => lesson.title === 'Lección 1.1: ¡Hola!');
    const lesson2_1 = lessons.find(lesson => lesson.title === 'Lección 2.1: Miembros directos');
    const saludosTopic = topics.find(topic => topic.title === 'Saludos básicos');
    const familiaTopic = topics.find(topic => topic.title === 'Miembros de la familia');

    if (!lesson1_1 || !lesson2_1 || !saludosTopic || !familiaTopic) {
        console.warn('Required lessons or topics for exercises not found. Skipping exercise seeding.');
        return;
    }


    const exercisesData = [
      {
        title: "Escribe tu nombre",
        description: "Practica escribir tu nombre en Kamëntsá (fonético)",
        type: "text_input",
        content: { instructions: "Escribe tu nombre:" },
        difficulty: "beginner",
        points: 10,
        timeLimit: 60,
        topic: saludosTopic,
        lesson: lesson1_1,
      },
      {
        title: "Identifica a la madre",
        description: "Selecciona la imagen que representa a la madre",
        type: "image_select",
        content: {
          instruction: "Selecciona la imagen de la madre:",
          options: [
            { image: "http://example.com/img/madre.jpg", isCorrect: true },
            { image: "http://example.com/img/padre.jpg", isCorrect: false },
          ],
        },
        difficulty: "beginner",
        points: 15,
        timeLimit: 90,
        topic: familiaTopic,
        lesson: lesson2_1,
      },
      {
        title: "Completa la frase de saludo",
        description: 'Completa la frase: "Aiñe, ¿chka ____?"',
        type: "fill_in_the-blank",
        content: { sentence: "Aiñe, ¿chka ____?", answer: "ichmëna" },
        difficulty: "beginner",
        points: 10,
        timeLimit: 60,
        topic: saludosTopic,
        lesson: lesson1_1,
      },
    ];

    for (const exerciseData of exercisesData) {
      // Need a way to uniquely identify exercises to avoid duplicates.
      // Checking by lesson and title
      const existingExercise = await this.exerciseRepository.findOne({
        where: { lesson: { id: exerciseData.lesson.id }, title: exerciseData.title },
      });

      if (!existingExercise) {
        const exercise = this.exerciseRepository.create(exerciseData);
        await this.exerciseRepository.save(exercise);
        console.log(`Exercise "${exercise.title}" created for Lesson "${exercise.lesson.title}".`);
      } else {
        console.log(`Exercise "${existingExercise.title}" already exists for Lesson "${existingExercise.lesson.title}".`);
      }
    }
    console.log('Exercises seeded.');
  }

  private async seedMultimedia() {
    console.log("Seeding Multimedia...");
    // Simular datos de Multimedia (ejemplo)
    const multimediaData = [
      {
        fileName: "audio_saludo.mp3",
        filePath: "uploads/audio_saludo.mp3",
        fileType: "audio",
        mimeType: "audio/mpeg",
        size: 1024,
        // lesson: lesson1_1, // Asociar con una lección si es relevante
      },
      {
        fileName: "imagen_familia.jpg",
        filePath: "uploads/imagen_familia.jpg",
        fileType: "image",
        mimeType: "image/jpeg",
        size: 2048,
        // lesson: lesson2_1, // Asociar con una lección si es relevante
      },
      {
        fileName: "video_mito.mp4",
        filePath: "uploads/video_mito.mp4",
        fileType: "video",
        mimeType: "video/mp4",
        size: 50000,
        // lesson: culturalContents[0], // Multimedia se asocia a Lesson, no CulturalContent
      },
    ];

    for (const multimediaItemData of multimediaData) {
      // Need a way to uniquely identify multimedia to avoid duplicates.
      // Checking by filePath (assuming filePaths are unique)
      const existingMultimedia = await this.multimediaRepository.findOne({
        where: { filePath: multimediaItemData.filePath },
      });

      if (!existingMultimedia) {
        const multimedia = this.multimediaRepository.create(multimediaItemData);
        await this.multimediaRepository.save(multimedia);
        console.log(`Multimedia "${multimedia.filePath}" created.`);
      } else {
        console.log(`Multimedia "${existingMultimedia.filePath}" already exists.`);
      }
    }
    console.log('Multimedia seeded.');
  }

  private async seedProgress() {
    console.log("Seeding Progress...");
    // Requires fetching Users and Exercises to link progress
    const testUser = await this.userRepository.findOne({ where: { username: 'testuser' } });
    const ejercicioNombre = await this.exerciseRepository.findOne({ where: { title: 'Escribe tu nombre' } });

    if (!testUser || !ejercicioNombre) {
        console.warn('Required user or exercise for progress not found. Skipping progress seeding.');
        return;
    }

    // Simular progreso para el usuario de prueba
    const existingProgress = await this.progressRepository.findOne({
        where: { user: { id: testUser.id }, exercise: { id: ejercicioNombre.id } },
    });

    if (!existingProgress) {
        const progress = this.progressRepository.create({
            user: testUser,
            exercise: ejercicioNombre,
            isCompleted: true,
            score: 100,
        });
        await this.progressRepository.save(progress);
        console.log(`Progress created for user "${testUser.username}" on exercise "${ejercicioNombre.title}".`);
    } else {
        console.log(`Progress already exists for user "${testUser.username}" on exercise "${ejercicioNombre.title}".`);
    }
    console.log('Progress seeded.');
  }

  private async seedStatistics() {
    console.log("Seeding Statistics...");
    // Requires fetching Users to link statistics
    const testUser: User | null = await this.userRepository.findOne({ where: { username: 'testuser' } });
    const teacherUser: User | null = await this.userRepository.findOne({ where: { username: 'teacheruser' } });

    if (!testUser || !teacherUser) {
        console.warn('Required users for statistics not found. Skipping statistics seeding.');
        return;
    }

    // Simular datos de Statistics para el usuario de prueba
    if (testUser) {
      const testUserStatisticsData = {
          userId: testUser.id,
          categoryMetrics: {
            [CategoryType.VOCABULARY]: {
              type: CategoryType.VOCABULARY,
              status: CategoryStatus.AVAILABLE,
              progress: {
                streak: 5,
                averageScore: 90,
                masteryLevel: 1,
                lastPracticed: new Date().toISOString(),
                totalExercises: 10,
                timeSpentMinutes: 30,
                completedExercises: 8,
              },
              difficulty: CategoryDifficulty.BEGINNER,
              prerequisites: [],
              subCategories: [],
              unlockRequirements: { requiredScore: 0, requiredCategories: [] },
            },
            // Add other categories as needed, using CategoryType enum
          },
          strengthAreas: [
            { name: "Vocabulario", score: 90 },
            { name: "Saludos", score: 95 },
          ],
          improvementAreas: [{ name: "Gramática", score: 0 }],
          learningMetrics: {
            totalLessonsCompleted: 1,
            totalExercisesCompleted: 2,
            averageScore: 91.6,
            totalTimeSpentMinutes: 60,
            longestStreak: 5,
            currentStreak: 5,
            lastActivityDate: new Date().toISOString(),
            totalMasteryScore: 2,
          },
          weeklyProgress: [],
          monthlyProgress: [],
          periodicProgress: [],
          achievementStats: {
            totalAchievements: 2,
            achievementsByCategory: { general: 1, aprendizaje: 1 },
            lastAchievementDate: new Date().toISOString(),
            specialAchievements: [],
          },
          badgeStats: {
            totalBadges: 0,
            badgesByTier: {},
            lastBadgeDate: null,
            activeBadges: [],
          },
          learningPath: {
            currentLevel: 5,
            recommendedCategories: [],
            nextMilestones: [],
            customGoals: [],
          },
      };

      const existingTestUserStatistics = await this.statisticsRepository.findOne({ where: { userId: testUser.id } });
      if (!existingTestUserStatistics) {
          const testUserStatistics = this.statisticsRepository.create(testUserStatisticsData);
          await this.statisticsRepository.save(testUserStatistics);
          console.log(`Statistics created for user "${testUser.username}".`);
      } else {
          console.log(`Statistics already exists for user "${testUser.username}".`);
      }
    }


    // Simular datos de Statistics para el usuario profesor
    if (teacherUser) {
      const teacherUserStatisticsData = {
          userId: teacherUser.id,
          categoryMetrics: {},
          strengthAreas: [],
          improvementAreas: [],
          learningMetrics: {
            totalLessonsCompleted: 1,
            totalExercisesCompleted: 0,
            averageScore: 95,
            totalTimeSpentMinutes: 20,
            longestStreak: 10,
            currentStreak: 10,
            lastActivityDate: new Date().toISOString(),
            totalMasteryScore: 0,
          },
          weeklyProgress: [],
          monthlyProgress: [],
          periodicProgress: [],
          achievementStats: {
            totalAchievements: 1,
            achievementsByCategory: { general: 1 },
            lastAchievementDate: new Date().toISOString(),
            specialAchievements: [],
          },
          badgeStats: {
            totalBadges: 0,
            badgesByTier: {},
            lastBadgeDate: null,
            activeBadges: [],
          },
          learningPath: {
            currentLevel: 5,
            recommendedCategories: [],
            nextMilestones: [],
            customGoals: [],
          },
      };

      const existingTeacherUserStatistics = await this.statisticsRepository.findOne({ where: { userId: teacherUser.id } });
      if (!existingTeacherUserStatistics) {
          const teacherUserStatistics = this.statisticsRepository.create(teacherUserStatisticsData);
          await this.statisticsRepository.save(teacherUserStatistics);
          console.log(`Statistics created for user "${teacherUser.username}".`);
      } else {
          console.log(`Statistics already exists for user "${teacherUser.username}".`);
      }
    }

    console.log('Statistics seeded.');
  }
}
