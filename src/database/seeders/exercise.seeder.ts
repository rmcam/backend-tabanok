import { DataSourceAwareSeed } from './index';
import { DataSource } from 'typeorm';
import { Exercise } from '../../features/exercises/entities/exercise.entity';
import { Topic } from '../../features/topic/entities/topic.entity';
import { Lesson } from '../../features/lesson/entities/lesson.entity';

export class ExerciseSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const exerciseRepository = this.dataSource.getRepository(Exercise);
    const topicRepository = this.dataSource.getRepository(Topic);
    const lessonRepository = this.dataSource.getRepository(Lesson);

    const topics = await topicRepository.find();
    const lessons = await lessonRepository.find();

    if (topics.length === 0) {
      console.log('No topics found. Skipping ExerciseSeeder.');
      return;
    }

    if (lessons.length === 0) {
        console.log('No lessons found. Skipping ExerciseSeeder.');
        return;
    }

    const exercisesToSeed = [
      {
        title: 'Ejercicio de Vocabulario 1',
        description: 'Identifica las palabras relacionadas con la familia.',
        type: 'multiple-choice', // Ejemplo de tipo de ejercicio
        content: { question: '¿Cuál de estas palabras significa "madre"?', options: ['Opción A', 'Opción B'] },
        difficulty: 'beginner',
        points: 10,
        topicTitle: 'Vocales', // Asociar a un tema existente
        lessonTitle: 'El Alfabeto Kamëntsá', // Asociar a una lección existente
      },
      {
        title: 'Ejercicio de Pronunciación 1',
        description: 'Graba tu pronunciación de las siguientes palabras.',
        type: 'recording', // Ejemplo de tipo de ejercicio
        content: { words: ['palabra1', 'palabra2'] },
        difficulty: 'intermediate',
        points: 15,
        topicTitle: 'Consonantes', // Asociar a un tema existente
        lessonTitle: 'Primeras Palabras', // Asociar a una lección existente
      },
      // Agregar más ejercicios según sea necesario, asegurando que los topicTitle y lessonTitle existan
    ];

    for (const exerciseData of exercisesToSeed) {
      const existingExercise = await exerciseRepository.findOne({ where: { title: exerciseData.title } });

      if (!existingExercise) {
        const topic = topics.find(t => t.title === exerciseData.topicTitle);
        const lesson = lessons.find(l => l.title === exerciseData.lessonTitle);

        if (topic && lesson) {
          const newExercise = exerciseRepository.create({
            title: exerciseData.title,
            description: exerciseData.description,
            type: exerciseData.type,
            content: exerciseData.content,
            difficulty: exerciseData.difficulty,
            points: exerciseData.points,
            topic: topic,
            topicId: topic.id,
            lesson: lesson,
            // lessonId: lesson.id, // La entidad Exercise no tiene lessonId directo, solo la relación ManyToOne
          });
          await exerciseRepository.save(newExercise);
          console.log(`Exercise "${exerciseData.title}" seeded.`);
        } else {
          console.log(`Topic "${exerciseData.topicTitle}" or Lesson "${exerciseData.lessonTitle}" not found for Exercise "${exerciseData.title}". Skipping.`);
        }
      } else {
        console.log(`Exercise "${exerciseData.title}" already exists. Skipping.`);
      }
    }
  }
}
