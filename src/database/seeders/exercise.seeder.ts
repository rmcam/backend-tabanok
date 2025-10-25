import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { Exercise } from '../../features/exercises/entities/exercise.entity';
import { Topic } from '../../features/topic/entities/topic.entity';
import { Lesson } from '../../features/lesson/entities/lesson.entity'; // Importar la entidad Lesson
import * as consolidatedDictionary from '../files/json/consolidated_dictionary.json';

// Función auxiliar para determinar el tema de una palabra
const getTopicForWord = (entry: any, topicsMap: Map<string, Topic>): Topic | undefined => {
    const type = entry.tipo;
    const definition = entry.significados?.[0]?.definicion.toLowerCase() || '';
    const entryWord = entry.entrada.toLowerCase();

    if (type === 'num.') return topicsMap.get('Los Números');
    if (definition.includes('saludo')) return topicsMap.get('Saludos y Despedidas');
    if (definition.includes('familia') || entryWord.includes('madre') || entryWord.includes('padre') || entryWord.includes('hermano') || entryWord.includes('hermana')) return topicsMap.get('La Familia');
    if (definition.includes('color')) return topicsMap.get('Los Colores');
    if (definition.includes('animal')) return topicsMap.get('Animales Comunes');
    if (definition.includes('comida') || definition.includes('alimento')) return topicsMap.get('Comida y Bebida');
    if (type === 's.' && definition.includes('sustantivo')) return topicsMap.get('Sustantivos y Clasificadores');
    if (type === 'pron.') return topicsMap.get('Pronombres Personales');
    if (type === 'v.t.' || type === 'v.') return topicsMap.get('Verbos y Conjugaciones Básicas');

    return topicsMap.get('Vocabulario General'); // Fallback
};

export class ExerciseSeeder extends DataSourceAwareSeed {
    constructor(dataSource: DataSource) {
        super(dataSource);
    }

    async run(): Promise<void> {
        console.log('Running ExerciseSeeder...');
        const exerciseRepository = this.dataSource.getRepository(Exercise);
        const topicRepository = this.dataSource.getRepository(Topic);
        const lessonRepository = this.dataSource.getRepository(Lesson); // Obtener el repositorio de Lesson

        const existingTopics = await topicRepository.find();
        const topicsMap = new Map(existingTopics.map(t => [t.title, t]));

        if (existingTopics.length === 0) {
            console.warn('No topics found. Skipping ExerciseSeeder. Ensure TopicSeeder runs before ExerciseSeeder.');
            return;
        }

        const existingLessons = await lessonRepository.find(); // Obtener todas las lecciones
        if (existingLessons.length === 0) {
            console.warn('No lessons found. Skipping ExerciseSeeder. Ensure LessonSeeder runs before ExerciseSeeder.');
            return;
        }
        const getRandomLessonId = () => existingLessons[Math.floor(Math.random() * existingLessons.length)].id; // Función para obtener un lessonId aleatorio

        const exercisesToSave: Exercise[] = [];

        const dictionaryEntries = consolidatedDictionary.sections.Diccionario.content.kamensta_espanol;
        const espanolKamentsaEntries = consolidatedDictionary.sections.Diccionario.content.espanol_kamensta;

        const getRandomIncorrectOption = (correctAnswer: string, allOptions: string[], numOptions: number = 3): string[] => {
            const incorrectOptions = allOptions.filter(opt => opt.toLowerCase() !== correctAnswer.toLowerCase());
            const shuffled = incorrectOptions.sort(() => 0.5 - Math.random());
            return shuffled.slice(0, numOptions);
        };

        // 1. Generar ejercicios de Vocabulario (K-E y E-K)
        for (const entry of dictionaryEntries) {
            if (entry.significados && entry.significados.length > 0) {
                const topic = getTopicForWord(entry, topicsMap);

                if (topic) {
                    const question = `¿Cuál es el significado en español de "${entry.entrada}"?`;
                    const correctAnswer = entry.significados[0].definicion;
                    const allPossibleAnswers = dictionaryEntries.flatMap(e => e.significados.map(s => s.definicion));
                    const incorrectOptions = getRandomIncorrectOption(correctAnswer, allPossibleAnswers, 3);
                    const options = [correctAnswer, ...incorrectOptions].sort(() => 0.5 - Math.random());

                    exercisesToSave.push(exerciseRepository.create({
                        title: `Vocabulario (K-E): ${entry.entrada}`,
                        description: `Identifica el significado de la palabra "${entry.entrada}".`,
                        type: 'quiz',
                        content: { question, options, answer: correctAnswer },
                        difficulty: 'easy',
                        points: 10,
                        timeLimit: 60,
                        isActive: true,
                        topicId: topic.id,
                        lessonId: getRandomLessonId(), // Asignar un lessonId aleatorio
                        tags: ['vocabulario', topic.title.toLowerCase()],
                    }));
                }
            }
        }

        for (const entry of espanolKamentsaEntries) {
            if (entry.equivalentes && entry.equivalentes.length > 0) {
                const topic = getTopicForWord(entry, topicsMap);

                if (topic) {
                    const question = `¿Cuál es la palabra en Kamëntsá para "${entry.entrada}"?`;
                    const correctAnswer = entry.equivalentes[0].palabra;
                    const allPossibleAnswers = espanolKamentsaEntries.flatMap(e => e.equivalentes.map(eq => eq.palabra));
                    const incorrectOptions = getRandomIncorrectOption(correctAnswer, allPossibleAnswers, 3);
                    const options = [correctAnswer, ...incorrectOptions].sort(() => 0.5 - Math.random());

                    exercisesToSave.push(exerciseRepository.create({
                        title: `Vocabulario (E-K): ${entry.entrada}`,
                        description: `Identifica la palabra en Kamëntsá para "${entry.entrada}".`,
                        type: 'quiz',
                        content: { question, options, answer: correctAnswer },
                        difficulty: 'easy',
                        points: 10,
                        timeLimit: 60,
                        isActive: true,
                        topicId: topic.id,
                        lessonId: getRandomLessonId(), // Asignar un lessonId aleatorio
                        tags: ['vocabulario', topic.title.toLowerCase()],
                    }));
                }
            }
        }

        // Lógica para ejercicios de fonética y gramática (a implementar)

        // Filter out exercises that already exist by title and topicId
        const finalExercisesToSave: Exercise[] = [];
        for (const exerciseData of exercisesToSave) {
            const existingExercise = await exerciseRepository.findOne({
                where: { title: exerciseData.title, topicId: exerciseData.topicId }
            });
            if (!existingExercise) {
                finalExercisesToSave.push(exerciseData);
            }
        }

        if (finalExercisesToSave.length > 0) {
            await exerciseRepository.save(finalExercisesToSave);
            console.log(`Seeded ${finalExercisesToSave.length} new exercises.`);
        } else {
            console.log('No new exercises to seed.');
        }
        console.log('Exercise seeder finished.');
    }
}
