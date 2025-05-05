import { DataSourceAwareSeed } from './index';
import { DataSource } from 'typeorm';
import { Activity, ActivityType, DifficultyLevel } from '../../features/activity/entities/activity.entity';
import { User } from '../../auth/entities/user.entity';

export class ActivitySeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const activityRepository = this.dataSource.getRepository(Activity);
    const userRepository = this.dataSource.getRepository(User);

    // Obtener un usuario existente para asociar las actividades
    const user = await userRepository.findOne({ where: { email: 'admin@example.com' } });

    if (!user) {
      console.log('Admin user not found. Skipping ActivitySeeder.');
      return;
    }

    const activitiesToSeed = [
      {
        title: 'Actividad de Lectura Inicial',
        description: 'Lee un texto sencillo en Kamëntsá.',
        type: ActivityType.READING,
        difficulty: DifficultyLevel.BEGINNER,
        content: { text: 'Este es un texto de ejemplo para la actividad de lectura.' },
        points: 10,
        user: user,
      },
      {
        title: 'Actividad de Escritura Básica',
        description: 'Escribe algunas palabras en Kamëntsá.',
        type: ActivityType.WRITING,
        difficulty: DifficultyLevel.BEGINNER,
        content: { prompt: 'Escribe 5 palabras que hayas aprendido.' },
        points: 15,
        user: user,
      },
      {
        title: 'Actividad de Escucha Nivel 1',
        description: 'Escucha un audio corto y responde preguntas.',
        type: ActivityType.LISTENING,
        difficulty: DifficultyLevel.INTERMEDIATE,
        content: { audioUrl: 'http://example.com/audio1.mp3', questions: ['Pregunta 1', 'Pregunta 2'] },
        points: 20,
        user: user,
      },
    ];

    for (const activityData of activitiesToSeed) {
      const existingActivity = await activityRepository.findOne({ where: { title: activityData.title } });

      if (!existingActivity) {
        const newActivity = activityRepository.create(activityData);
        await activityRepository.save(newActivity);
        console.log(`Activity "${activityData.title}" seeded.`);
      } else {
        console.log(`Activity "${activityData.title}" already exists. Skipping.`);
      }
    }
  }
}
