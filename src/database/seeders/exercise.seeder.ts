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
    ];

    const moreExercisesToSeed = [
      {
        title: 'Ejercicio de Vocabulario 2',
        description: 'Relaciona las palabras con sus imágenes.',
        type: 'matching',
        content: { pairs: [{ text: 'palabraA', imageUrl: 'urlA' }, { text: 'palabraB', imageUrl: 'urlB' }], sentence: undefined, answer: undefined, audioUrl: undefined, question: undefined, options: undefined, words: undefined },
        difficulty: 'beginner',
        points: 10,
        topicTitle: 'Vocales',
        lessonTitle: 'Las Vocales',
      },
      {
        title: 'Ejercicio de Gramática 1',
        description: 'Completa las oraciones con la forma correcta del verbo.',
        type: 'fill-in-the-blanks',
        content: { sentence: 'El niño ___ (jugar) en el parque.', answer: 'juega', pairs: undefined, imageUrl: undefined, audioUrl: undefined, question: undefined, options: undefined, words: undefined },
        difficulty: 'intermediate',
        points: 20,
        topicTitle: 'Consonantes', // Asumiendo que la gramática inicial se relaciona con sonidos
        lessonTitle: 'Primeras Palabras',
      },
      {
        title: 'Ejercicio de Comprensión Auditiva 1',
        description: 'Escucha el audio y responde la pregunta.',
        type: 'listening-comprehension',
        content: { audioUrl: 'url_audio', question: '¿Qué dijo la persona?', options: ['Opción X', 'Opción Y'], pairs: undefined, imageUrl: undefined, sentence: undefined, answer: undefined, words: undefined },
        difficulty: 'advanced',
        points: 25,
        topicTitle: 'Consonantes', // Asumiendo que la comprensión auditiva inicial se relaciona con sonidos
        lessonTitle: 'Cómo Saludar',
      },
    ];

    exercisesToSeed.push(...moreExercisesToSeed);

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
