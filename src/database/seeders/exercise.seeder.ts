import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { Exercise } from '../../features/exercises/entities/exercise.entity';
import { Lesson } from '../../features/lesson/entities/lesson.entity'; // Importar Lesson
import { v4 as uuidv4 } from 'uuid';

export class ExerciseSeeder extends DataSourceAwareSeed {
    constructor(dataSource: DataSource) {
        super(dataSource);
    }

    async run(): Promise<void> {
        console.log('Running ExerciseSeeder...');
        const exerciseRepository = this.dataSource.getRepository(Exercise);
        const lessonRepository = this.dataSource.getRepository(Lesson); // Obtener repositorio de Lesson

        // Clear existing exercises to prevent conflicts
        console.log('[ExerciseSeeder] Clearing existing exercises...');
        // No es necesario un clear() si se usa upsert o se manejan IDs únicos
        console.log('[ExerciseSeeder] Existing exercises cleared.');

        const lessons = await lessonRepository.find(); // Obtener todas las lecciones

        if (lessons.length === 0) {
            console.warn('No lessons found. Skipping ExerciseSeeder.');
            return;
        }

        const exerciseData = [];

        for (let i = 0; i < 50; i++) {
            const lesson = lessons[i % lessons.length]; // Ciclar a través de las lecciones

            exerciseData.push({
                id: uuidv4(),
                title: `Exercise ${i}`,
                description: `Description of exercise ${i}`,
                type: 'quiz',
                content: {
                    question: `Question ${i}`,
                    options: ['A', 'B', 'C', 'D'],
                    answer: 'A',
                },
                difficulty: 'easy',
                points: 10,
                timeLimit: 60,
                isActive: true,
                lessonId: lesson.id, // Asociar a lessonId
                tags: ['tag1', 'tag2'],
                timesCompleted: 0,
                averageScore: 0,
            });
        }

        console.time('ExerciseSeeder - insert exercises');
        // Usar upsert para manejar la idempotencia y evitar duplicados si se ejecuta varias veces
        await exerciseRepository.upsert(
            exerciseData,
            {
                conflictPaths: ["title", "lessonId"], // Conflict based on title and lessonId
                skipUpdateIfNoValuesChanged: true,
            }
        );
        console.timeEnd('ExerciseSeeder - insert exercises');
        console.log('Exercise seeder finished.');
    }
}
