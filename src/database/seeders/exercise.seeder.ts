import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { Exercise } from '../../features/exercises/entities/exercise.entity';
import { Unity } from '../../features/unity/entities/unity.entity';
import { Topic } from '../../features/topic/entities/topic.entity';
import { Lesson } from '../../features/lesson/entities/lesson.entity'; // Importar Lesson
import * as consolidatedDictionary from '../files/json/consolidated_dictionary.json';

export class ExerciseSeeder extends DataSourceAwareSeed {
    constructor(dataSource: DataSource) {
        super(dataSource);
    }

    async run(): Promise<void> {
        console.log('Running ExerciseSeeder...');
        const exerciseRepository = this.dataSource.getRepository(Exercise);
        const topicRepository = this.dataSource.getRepository(Topic);
        const unityRepository = this.dataSource.getRepository(Unity);
        const lessonRepository = this.dataSource.getRepository(Lesson); // Obtener el repositorio de Lesson

        // Ensure core topics exist or create them
        const coreTopics = [
            { title: 'vocabulario general', unityName: 'Vocabulario General' },
            { title: 'fonética y pronunciación', unityName: 'Vocales y Consonantes' },
            { title: 'gramática básica', unityName: 'Gramática Fundamental' },
            { title: 'general', unityName: 'Introducción al Kamëntsá' },
            { title: 'sustantivos', unityName: 'Gramática Fundamental' },
            { title: 'pronombres', unityName: 'Gramática Fundamental' },
            { title: 'verbos', unityName: 'Gramática Fundamental' },
            { title: 'alfabeto', unityName: 'Vocales y Consonantes' },
            { title: 'número', unityName: 'Gramática Fundamental' },
            { title: 'patrones acentuación', unityName: 'Vocales y Consonantes' },
            { title: 'variaciones dialectales', unityName: 'Vocales y Consonantes' },
            { title: 'articulación detallada', unityName: 'Vocales y Consonantes' },
            { title: 'combinaciones sonoras', unityName: 'Vocales y Consonantes' },
            { title: 'consonantes', unityName: 'Vocales y Consonantes' },
            { title: 'pronunciación', unityName: 'Vocales y Consonantes' },
            { title: 'vocales', unityName: 'Vocales y Consonantes' },
            { title: 'clasificadores nominales', unityName: 'Gramática Fundamental' },
            // Add other topics that might be relevant for exercises
            { title: 'historia', unityName: 'Contenido del Diccionario' },
            { title: 'mitos y leyendas', unityName: 'Contenido del Diccionario' },
            { title: 'música', unityName: 'Contenido del Diccionario' },
            { title: 'danza', unityName: 'Contenido del Diccionario' },
            { title: 'medicina', unityName: 'Contenido del Diccionario' },
            { title: 'artesanía', unityName: 'Contenido del Diccionario' },
            { title: 'rituales', unityName: 'Contenido del Diccionario' },
            { title: 'colores', unityName: 'Vocabulario General' },
            { title: 'números', unityName: 'Vocabulario General' },
            { title: 'animales', unityName: 'Vocabulario General' },
            { title: 'plantas', unityName: 'Vocabulario General' },
            { title: 'cuerpo humano', unityName: 'Vocabulario General' },
            { title: 'preguntas y respuestas', unityName: 'Gramática Fundamental' },
            { title: 'sentimientos', unityName: 'Vocabulario General' },
            { title: 'tiempos verbales', unityName: 'Gramática Fundamental' },
            { title: 'saludos', unityName: 'Vocabulario General' },
            { title: 'familia', unityName: 'Vocabulario General' },
            { title: 'comida', unityName: 'Vocabulario General' },
            { title: 'vida diaria', unityName: 'Vocabulario General' },
            { title: 'sintaxis avanzada', unityName: 'Gramática Fundamental' },
        ];

        let existingTopics = await topicRepository.find();
        const topicsMap = new Map(existingTopics.map(t => [t.title.toLowerCase(), t]));

        for (const topicData of coreTopics) {
            if (!topicsMap.has(topicData.title.toLowerCase())) {
                const unity = await unityRepository.findOne({ where: { title: topicData.unityName } });
                
                if (!unity) {
                    console.warn(`[ExerciseSeeder] No se encontró la unidad para el topic ${topicData.title}. Saltando.`);
                    continue;
                }

                const newTopic = topicRepository.create({
                    title: topicData.title.toLowerCase(),
                    description: `Topic para ejercicios de ${topicData.title.toLowerCase()}.`,
                    unityId: unity.id,
                });
                await topicRepository.save(newTopic);
                topicsMap.set(topicData.title.toLowerCase(), newTopic);
                console.log(`[ExerciseSeeder] Creado topic: ${topicData.title}`);
            }
        }
        existingTopics = Array.from(topicsMap.values());

        if (existingTopics.length === 0) {
            console.warn('No topics found after seeding core topics. Skipping ExerciseSeeder.');
            return;
        }

        const existingLessons = await lessonRepository.find({ relations: ['unity'] }); // Obtener todas las lecciones con sus unidades
        const lessonsMap = new Map<string, Lesson[]>(); // Map<topicId, Lesson[]>
        existingLessons.forEach(lesson => {
            // Asumiendo que Lesson tiene un topicId o se puede inferir de la unidad
            // Si Lesson no tiene topicId directo, se necesitaría una lógica más compleja
            // Por ahora, asumiré que Lesson tiene un topicId o que podemos mapear por unityId
            // Para simplificar, si Lesson tiene un topicId, lo usaré. Si no, usaré unityId.
            // Para este ejemplo, voy a asumir que Lesson tiene un topicId para una relación más directa.
            // Si no lo tiene, se necesitaría una modificación en la entidad Lesson.
            // Por ahora, voy a usar el unityId de la lección para mapear a los ejercicios.
            if (lesson.unityId) { // Usar unityId para mapear lecciones a unidades
                if (!lessonsMap.has(lesson.unityId)) {
                    lessonsMap.set(lesson.unityId, []);
                }
                lessonsMap.get(lesson.unityId)?.push(lesson);
            }
        });


        const exercisesToSave: Exercise[] = [];
        const dictionaryEntries = consolidatedDictionary.sections.Diccionario.content.kamensta_espanol;
        const espanolKamentsaEntries = consolidatedDictionary.sections.Diccionario.content.espanol_kamensta;
        const foneticaContent = consolidatedDictionary.sections.Fonetica.content;
        const gramaticaContent = consolidatedDictionary.sections.Gramatica.content;
        const pronombresContent = consolidatedDictionary.sections.Pronombres.content;
        const consonantesContent = consolidatedDictionary.sections.Consonantes.content;
        const vocalesContent = consolidatedDictionary.sections.Vocales.content;
        const clasificadoresNominalesContent = consolidatedDictionary.clasificadores_nominales.content;

        // Declare topic variables here to ensure they are in scope
        const vocabTopic = topicsMap.get('vocabulario general');
        const foneticaTopic = topicsMap.get('fonética y pronunciación');
        const gramaticaTopic = topicsMap.get('gramática básica');
        const clasificadoresTopic = topicsMap.get('clasificadores nominales');


        // Helper to get a random incorrect option for quizzes
        const getRandomIncorrectOption = (correctAnswer: string, allOptions: string[], numOptions: number = 3): string[] => {
            const incorrectOptions = allOptions.filter(opt => opt.toLowerCase() !== correctAnswer.toLowerCase());
            const shuffled = incorrectOptions.sort(() => 0.5 - Math.random());
            return shuffled.slice(0, numOptions);
        };

        // Helper para obtener una lección aleatoria basada en el topicId del ejercicio
        const getRandomLessonForTopic = (topicId: string): Lesson | undefined => {
            const topic = existingTopics.find(t => t.id === topicId);
            if (!topic || !topic.unityId) return undefined; // Asegurarse de que el topic y su unityId existan

            const lessonsInUnity = lessonsMap.get(topic.unityId);
            if (lessonsInUnity && lessonsInUnity.length > 0) {
                return lessonsInUnity[Math.floor(Math.random() * lessonsInUnity.length)];
            }
            return undefined;
        };


        // 1. Generar ejercicios de Vocabulario (Quiz: Kamëntsá a Español)
        if (vocabTopic && dictionaryEntries) {
            const lesson = getRandomLessonForTopic(vocabTopic.id);
            for (let i = 0; i < Math.min(dictionaryEntries.length, 30); i++) {
                const entry = dictionaryEntries[i];
                if (entry.significados && entry.significados.length > 0) {
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
                        topicId: vocabTopic.id,
                        lesson: lesson, // Asignar la lección
                        tags: ['vocabulario', 'diccionario', 'kamentsa-espanol'],
                        timesCompleted: 0,
                        averageScore: 0,
                    }));
                }
            }
        }

        // 2. Generar ejercicios de Vocabulario (Quiz: Español a Kamëntsá)
        if (vocabTopic && espanolKamentsaEntries) {
            const lesson = getRandomLessonForTopic(vocabTopic.id);
            for (let i = 0; i < Math.min(espanolKamentsaEntries.length, 30); i++) {
                const entry = espanolKamentsaEntries[i];
                if (entry.equivalentes && entry.equivalentes.length > 0) {
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
                        topicId: vocabTopic.id,
                        lesson: lesson, // Asignar la lección
                        tags: ['vocabulario', 'diccionario', 'espanol-kamentsa'],
                        timesCompleted: 0,
                        averageScore: 0,
                    }));
                }
            }
        }

        // 3. Generar ejercicios de Fonética (Quiz de identificación de vocales)
        if (foneticaTopic && vocalesContent?.simples) {
            const lesson = getRandomLessonForTopic(foneticaTopic.id);
            const allVowels = vocalesContent.simples.map((v: any) => v.vocal);
            for (const vowel of allVowels) {
                const question = `¿Cuál de las siguientes es una vocal simple en Kamëntsá?`;
                const options = [vowel, ...getRandomIncorrectOption(vowel, allVowels, 3)].sort(() => 0.5 - Math.random());
                exercisesToSave.push(exerciseRepository.create({
                    title: `Fonética: Vocal "${vowel}"`,
                    description: `Identifica la vocal simple "${vowel}".`,
                    type: 'quiz',
                    content: { question, options, answer: vowel },
                    difficulty: 'easy',
                    points: 10,
                    timeLimit: 60,
                    isActive: true,
                    topicId: foneticaTopic.id,
                    lesson: lesson, // Asignar la lección
                    tags: ['fonética', 'vocales'],
                    timesCompleted: 0,
                    averageScore: 0,
                }));
            }
        }

        // 4. Generar ejercicios de Fonética (Quiz de identificación de consonantes)
        if (foneticaTopic && consonantesContent) {
            const lesson = getRandomLessonForTopic(foneticaTopic.id);
            const allConsonants = [
                ...(consonantesContent.oclusivas || []).map((c: any) => c.consonante),
                ...(consonantesContent.fricativas || []).map((c: any) => c.consonante),
                ...(consonantesContent.africadas || []).map((c: any) => c.consonante),
                ...(consonantesContent.nasales || []).map((c: any) => c.consonante),
                ...(consonantesContent.laterales || []).map((c: any) => c.consonante),
                ...(consonantesContent.vibrantes || []).map((c: any) => c.consonante),
            ].filter(Boolean);

            for (let i = 0; i < Math.min(allConsonants.length, 10); i++) {
                const consonant = allConsonants[i];
                const question = `¿Cuál de las siguientes es una consonante en Kamëntsá?`;
                const options = [consonant, ...getRandomIncorrectOption(consonant, allConsonants, 3)].sort(() => 0.5 - Math.random());
                exercisesToSave.push(exerciseRepository.create({
                    title: `Fonética: Consonante "${consonant}"`,
                    description: `Identifica la consonante "${consonant}".`,
                    type: 'quiz',
                    content: { question, options, answer: consonant },
                    difficulty: 'medium',
                    points: 15,
                    timeLimit: 75,
                    isActive: true,
                    topicId: foneticaTopic.id,
                    lesson: lesson, // Asignar la lección
                    tags: ['fonética', 'consonantes'],
                    timesCompleted: 0,
                    averageScore: 0,
                }));
            }
        }

        // 5. Generar ejercicios de Gramática (Fill in the blank - Pronombres)
        if (gramaticaTopic && pronombresContent?.personales) {
            const lesson = getRandomLessonForTopic(gramaticaTopic.id);
            const pronouns = pronombresContent.personales;
            const firstPersonSingular = pronouns.find((p: any) => p.persona === 'Primera persona')?.singular;
            if (firstPersonSingular) {
                exercisesToSave.push(exerciseRepository.create({
                    title: `Gramática: Pronombre "${firstPersonSingular.palabra}" (Yo)`,
                    description: `Completa la oración con el pronombre correcto: "Yo soy Kamëntsá."`,
                    type: 'fill_in_the_blank',
                    content: { sentence: `Ats̈ ___ Kamëntsá.`, answer: firstPersonSingular.palabra },
                    difficulty: 'easy',
                    points: 10,
                    timeLimit: 60,
                    isActive: true,
                    topicId: gramaticaTopic.id,
                    lesson: lesson, // Asignar la lección
                    tags: ['gramática', 'pronombres', 'singular'],
                    timesCompleted: 0,
                    averageScore: 0,
                }));
            }

            const secondPersonSingular = pronouns.find((p: any) => p.persona === 'Segunda persona')?.singular;
            if (secondPersonSingular) {
                exercisesToSave.push(exerciseRepository.create({
                    title: `Gramática: Pronombre "${secondPersonSingular.palabra}" (Tú)`,
                    description: `Completa la oración con el pronombre correcto: "Tú eres mi amigo."`,
                    type: 'fill_in_the_blank',
                    content: { sentence: `___ jats̈an.`, answer: secondPersonSingular.palabra },
                    difficulty: 'easy',
                    points: 10,
                    timeLimit: 60,
                    isActive: true,
                    topicId: gramaticaTopic.id,
                    lesson: lesson, // Asignar la lección
                    tags: ['gramática', 'pronombres', 'singular'],
                    timesCompleted: 0,
                    averageScore: 0,
                }));
            }

            const thirdPersonSingular = pronouns.find((p: any) => p.persona === 'Tercera persona')?.singular;
            if (thirdPersonSingular) {
                exercisesToSave.push(exerciseRepository.create({
                    title: `Gramática: Pronombre "${thirdPersonSingular.palabra}" (Él/Ella)`,
                    description: `Completa la oración con el pronombre correcto: "Él se fue a trabajar."`,
                    type: 'fill_in_the_blank',
                    content: { sentence: `___ trabajo tonjá.`, answer: thirdPersonSingular.palabra },
                    difficulty: 'medium',
                    points: 15,
                    timeLimit: 90,
                    isActive: true,
                    topicId: gramaticaTopic.id,
                    lesson: lesson, // Asignar la lección
                    tags: ['gramática', 'pronombres', 'singular'],
                    timesCompleted: 0,
                    averageScore: 0,
                }));
            }

            const firstPersonPlural = pronouns.find((p: any) => p.persona === 'Primera persona')?.plural;
            if (firstPersonPlural) {
                exercisesToSave.push(exerciseRepository.create({
                    title: `Gramática: Pronombre "${firstPersonPlural.palabra}" (Nosotros)`,
                    description: `Completa la oración con el pronombre correcto: "Nosotros vamos a la casa."`,
                    type: 'fill_in_the_blank',
                    content: { sentence: `___ jats̈an.`, answer: firstPersonPlural.palabra },
                    difficulty: 'medium',
                    points: 15,
                    timeLimit: 90,
                    isActive: true,
                    topicId: gramaticaTopic.id,
                    lesson: lesson, // Asignar la lección
                    tags: ['gramática', 'pronombres', 'plural'],
                    timesCompleted: 0,
                    averageScore: 0,
                }));
            }

            const secondPersonPlural = pronouns.find((p: any) => p.persona === 'Segunda persona')?.plural;
            if (secondPersonPlural) {
                exercisesToSave.push(exerciseRepository.create({
                    title: `Gramática: Pronombre "${secondPersonPlural.palabra}" (Ustedes)`,
                    description: `Completa la oración con el pronombre correcto: "Ustedes están aprendiendo."`,
                    type: 'fill_in_the_blank',
                    content: { sentence: `___ jats̈an.`, answer: secondPersonPlural.palabra },
                    difficulty: 'medium',
                    points: 15,
                    timeLimit: 90,
                    isActive: true,
                    topicId: gramaticaTopic.id,
                    lesson: lesson, // Asignar la lección
                    tags: ['gramática', 'pronombres', 'plural'],
                    timesCompleted: 0,
                    averageScore: 0,
                }));
            }

            const thirdPersonPlural = pronouns.find((p: any) => p.persona === 'Tercera persona')?.plural;
            if (thirdPersonPlural) {
                exercisesToSave.push(exerciseRepository.create({
                    title: `Gramática: Pronombre "${thirdPersonPlural.palabra}" (Ellos/Ellas)`,
                    description: `Completa la oración con el pronombre correcto: "Ellos están comiendo."`,
                    type: 'fill_in_the_blank',
                    content: { sentence: `___ endësá.`, answer: thirdPersonPlural.palabra },
                    difficulty: 'medium',
                    points: 15,
                    timeLimit: 90,
                    isActive: true,
                    topicId: gramaticaTopic.id,
                    lesson: lesson, // Asignar la lección
                    tags: ['gramática', 'pronombres', 'plural'],
                    timesCompleted: 0,
                    averageScore: 0,
                }));
            }
        }

        // 6. Generar ejercicios de Gramática (Clasificadores Nominales - Matching)
        if (clasificadoresTopic && clasificadoresNominalesContent) {
            const lesson = getRandomLessonForTopic(clasificadoresTopic.id);
            const matchingPairs: { prompt: string; answer: string }[] = [];
            for (let i = 0; i < Math.min(clasificadoresNominalesContent.length, 10); i++) {
                const clasificador = clasificadoresNominalesContent[i];
                if (clasificador.ejemplos && clasificador.ejemplos.length > 0) {
                    const example = clasificador.ejemplos[0];
                    matchingPairs.push({
                        prompt: `"${example.palabra}" (${example.traduccion})`,
                        answer: clasificador.sufijo,
                    });
                }
            }
            if (matchingPairs.length > 0) {
                exercisesToSave.push(exerciseRepository.create({
                    title: `Gramática: Empareja Clasificadores Nominales`,
                    description: `Empareja la palabra con su clasificador nominal correcto.`,
                    type: 'matching',
                    content: { pairs: matchingPairs },
                    difficulty: 'advanced',
                    points: 20,
                    timeLimit: 120,
                    isActive: true,
                    topicId: clasificadoresTopic.id,
                    lesson: lesson, // Asignar la lección
                    tags: ['gramática', 'clasificadores'],
                    timesCompleted: 0,
                    averageScore: 0,
                }));
            }
        }

        // 7. Generar ejercicios de Gramática (Verbos - Conjugación)
        const verbosContent = consolidatedDictionary.sections.Verbos.content;
        if (gramaticaTopic && verbosContent?.conjugaciones?.presente?.singular) {
            const lesson = getRandomLessonForTopic(gramaticaTopic.id);
            const verbExamples = [
                { verb: 'comer', kamentsaBase: 'endësá', conjugations: verbosContent.conjugaciones.presente.singular },
                { verb: 'ir', kamentsaBase: 'tonjá', conjugations: verbosContent.conjugaciones.presente.singular }, // Asumiendo que 'ir' tiene conjugaciones similares
                { verb: 'hablar', kamentsaBase: 'ats̈a', conjugations: verbosContent.conjugaciones.presente.singular }, // Asumiendo que 'hablar' tiene conjugaciones similares
            ];

            for (const verbEx of verbExamples) {
                const question = `Conjuga el verbo "${verbEx.verb}" en Kamëntsá (presente singular):`;
                const options = [
                    { prompt: 'Yo', answer: verbEx.conjugations.primera },
                    { prompt: 'Tú', answer: verbEx.conjugations.segunda },
                    { prompt: 'Él/Ella', answer: verbEx.conjugations.tercera },
                ];
                exercisesToSave.push(exerciseRepository.create({
                    title: `Gramática: Conjugación de "${verbEx.verb}" (Presente)`,
                    description: `Escribe la conjugación correcta del verbo "${verbEx.verb}".`,
                    type: 'fill_in_the_blank_multiple',
                    content: { question, options },
                    difficulty: 'medium',
                    points: 20,
                    timeLimit: 120,
                    isActive: true,
                    topicId: gramaticaTopic.id,
                    lesson: lesson, // Asignar la lección
                    tags: ['gramática', 'verbos', 'conjugación'],
                    timesCompleted: 0,
                    averageScore: 0,
                }));
            }
        }

        // Filter out exercises that already exist by title and topicId
        const finalExercisesToSave: Exercise[] = [];
        for (const exerciseData of exercisesToSave) {
            const existingExercise = await exerciseRepository.findOne({
                where: { title: exerciseData.title, topicId: exerciseData.topicId }
            });
            if (!existingExercise) {
                finalExercisesToSave.push(exerciseData);
            } else {
                console.log(`Exercise "${exerciseData.title}" for topic ID "${exerciseData.topicId}" already exists. Skipping.`);
            }
        }

        if (finalExercisesToSave.length > 0) {
            console.time('ExerciseSeeder - insert exercises');
            await exerciseRepository.save(finalExercisesToSave);
            console.timeEnd('ExerciseSeeder - insert exercises');
            console.log(`Seeded ${finalExercisesToSave.length} new exercises.`);
        } else {
            console.log('No new exercises to seed.');
        }
        console.log('Exercise seeder finished.');
    }
}
