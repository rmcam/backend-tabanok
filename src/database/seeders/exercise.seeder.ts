
import { DataSource } from 'typeorm';
import { Exercise } from '../../features/exercises/entities/exercise.entity';
import { Topic } from '../../features/topic/entities/topic.entity';
import { Lesson } from '../../features/lesson/entities/lesson.entity';
import { DataSourceAwareSeed } from './data-source-aware-seed';

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
      // Ejercicios de Vocabulario (Múltiple Opción)
      {
        title: 'Vocabulario: La Familia',
        description: 'Identifica las palabras relacionadas con los miembros de la familia.',
        type: 'multiple-choice',
        content: {
          question: '¿Cuál de estas palabras significa "madre" en Kamëntsá?',
          options: ['Bebmá', 'Batá', 'Uaquiñá', 'Cats̈ata'],
          correctAnswer: 'Batá',
        },
        difficulty: 'beginner',
        points: 10,
        topicTitle: 'Familia',
        lessonTitle: 'Familia y Comunidad',
      },
      {
        title: 'Vocabulario: Comida',
        description: 'Selecciona la palabra que corresponde a "maíz".',
        type: 'multiple-choice',
        content: {
          question: '¿Cómo se dice "maíz" en Kamëntsá?',
          options: ['Saná', 'Mashacbe', 'Tjañ', 'Bejay'],
          correctAnswer: 'Mashacbe',
        },
        difficulty: 'beginner',
        points: 10,
        topicTitle: 'Comida',
        lessonTitle: 'Comida y Naturaleza',
      },
      {
        title: 'Vocabulario: Colores',
        description: 'Identifica el color "azul".',
        type: 'multiple-choice',
        content: {
          question: '¿Cuál es la palabra para "azul" en Kamëntsá?',
          options: ['Uabocnana', 'Uabuangana', 'Buashënga', 'Nguëmëná'],
          correctAnswer: 'Buashënga',
        },
        difficulty: 'beginner',
        points: 10,
        topicTitle: 'Colores',
        lessonTitle: 'Colores y Formas',
      },

      // Ejercicios de Pronunciación (Grabación)
      {
        title: 'Pronunciación: Vocales Especiales',
        description: 'Graba tu pronunciación de palabras con la vocal "ë".',
        type: 'recording',
        content: { words: ['sësna', 'fsn̈ëbé', 'tsëmbé'] },
        difficulty: 'intermediate',
        points: 15,
        topicTitle: 'Fonética y Pronunciación',
        lessonTitle: 'Vocales y Consonantes',
      },
      {
        title: 'Pronunciación: Grupos Consonánticos',
        description: 'Graba tu pronunciación de palabras con grupos consonánticos difíciles.',
        type: 'recording',
        content: { words: ['ts̈abá', 'ndetsb̈é', 'fsn̈ëbé'] },
        difficulty: 'advanced',
        points: 20,
        topicTitle: 'Fonética y Pronunciación',
        lessonTitle: 'Combinaciones Sonoras',
      },

      // Ejercicios de Gramática (Completar Espacios)
      {
        title: 'Gramática: Tiempos Verbales',
        description: 'Completa las oraciones con la forma correcta del verbo "comer" (jabostán).',
        type: 'fill-in-the-blanks',
        content: {
          sentence: 'Ats̈ saná ___ . (Yo comida ___) (presente)',
          answer: 'sëntsamá',
        },
        difficulty: 'intermediate',
        points: 20,
        topicTitle: 'Gramática Básica',
        lessonTitle: 'Tiempos Verbales Básicos',
      },
      {
        title: 'Gramática: Pronombres Personales',
        description: 'Completa las oraciones con el pronombre personal correcto.',
        type: 'fill-in-the-blanks',
        content: {
          sentence: '___ trabajo tonjá. (___ trabajo se fue) (Él)',
          answer: 'Cha',
        },
        difficulty: 'beginner',
        points: 15,
        topicTitle: 'Gramática Básica',
        lessonTitle: 'Pronombres',
      },

      // Ejercicios de Comprensión Lectora
      {
        title: 'Comprensión Lectora: Cuento Corto',
        description: 'Lee el cuento "El Perro y el Gato" y responde las preguntas.',
        type: 'reading-comprehension',
        content: {
          text: 'Shboachan y Mishén eran amigos...',
          questions: [
            '¿Quiénes eran los personajes principales?',
            '¿Qué hicieron juntos?',
          ],
          answers: [
            'Shboachan y Mishén',
            'Jugaron en el jardín', // Ejemplo de respuesta
          ],
        },
        difficulty: 'advanced',
        points: 25,
        topicTitle: 'Comprensión Lectora',
        lessonTitle: 'Textos Sencillos',
      },

      // Ejercicios Interactivos (Emparejar)
      {
        title: 'Interactivo: Empareja Palabras y Significados',
        description: 'Empareja las palabras en Kamëntsá con su significado en español.',
        type: 'matching',
        content: {
          pairs: [
            { left: 'Tsasá', right: 'Casa' },
            { left: 'Bejay', right: 'Agua' },
            { left: 'Saná', right: 'Comida' },
          ],
        },
        difficulty: 'beginner',
        points: 15,
        topicTitle: 'Vocabulario General',
        lessonTitle: 'Vocabulario Esencial',
      },

      // Ejercicios Culturales (Respuesta Corta)
      {
        title: 'Cultural: El Carnaval de Sibundoy',
        description: 'Describe brevemente la importancia del Carnaval de Sibundoy.',
        type: 'short-answer',
        content: {
          question: '¿Por qué es importante el Carnaval de Sibundoy para el pueblo Kamëntsá?',
          suggestedAnswer: 'Es la celebración principal del año nuevo y un momento de encuentro cultural.',
        },
        difficulty: 'intermediate',
        points: 20,
        topicTitle: 'Cultura y Tradiciones',
        lessonTitle: 'Rituales y Ceremonias',
      },
    ];

    for (const exerciseData of exercisesToSeed) {
      const topic = topics.find(t => t.title === exerciseData.topicTitle);
      const lesson = lessons.find(l => l.title === exerciseData.lessonTitle);

      if (!topic) {
        console.warn(`Topic with title "${exerciseData.topicTitle}" not found. Skipping exercise "${exerciseData.title}".`);
        continue;
      }

      if (!lesson) {
        console.warn(`Lesson with title "${exerciseData.lessonTitle}" not found. Skipping exercise "${exerciseData.title}".`);
        continue;
      }

      const existingExercise = await exerciseRepository.findOne({ where: { title: exerciseData.title } });

      if (!existingExercise) {
        const newExercise = exerciseRepository.create({
          ...exerciseData,
          topic: topic,
          lesson: lesson,
        });
        await exerciseRepository.save(newExercise);
        console.log(`Exercise "${newExercise.title}" seeded.`);
      } else {
        console.log(`Exercise "${existingExercise.title}" already exists. Skipping.`);
      }
    }
  }
}
