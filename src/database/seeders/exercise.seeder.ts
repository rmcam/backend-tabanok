import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { Exercise } from '../../features/exercises/entities/exercise.entity';
import { Topic } from '../../features/topic/entities/topic.entity';
import { Lesson } from '../../features/lesson/entities/lesson.entity'; // Importar Lesson
import { v4 as uuidv4 } from 'uuid';

export class ExerciseSeeder extends DataSourceAwareSeed {
    constructor(dataSource: DataSource) {
        super(dataSource);
    }

    async run(): Promise<void> {
        console.log('Running ExerciseSeeder...');
        const exerciseRepository = this.dataSource.getRepository(Exercise);
        const topicRepository = this.dataSource.getRepository(Topic);
        const lessonRepository = this.dataSource.getRepository(Lesson); // Obtener LessonRepository

        // Clear existing exercises to prevent conflicts
        console.log('[ExerciseSeeder] Clearing existing exercises...');
        await exerciseRepository.clear(); // Usar clear para eliminar todos los registros
        console.log('[ExerciseSeeder] Existing exercises cleared.');

        const topics = await topicRepository.find();
        const lessons = await lessonRepository.find(); // Obtener todas las lecciones

        if (topics.length === 0) {
            console.warn('No topics found. Skipping ExerciseSeeder.');
            return;
        }
        if (lessons.length === 0) {
            console.warn('No lessons found. Skipping ExerciseSeeder.');
            return;
        }

        const exerciseData = [];

        for (let i = 0; i < 50; i++) {
            const topic = topics[i % topics.length]; // Cycle through topics
            const lesson = lessons[i % lessons.length]; // Cycle through lessons

            exerciseData.push({
                id: uuidv4(),
                title: `Exercise ${i}`,
                description: `Description of exercise ${i} for lesson ${lesson.title}`,
                type: 'quiz',
                content: {
                    question: `Question ${i} for ${lesson.title}`,
                    options: ['A', 'B', 'C', 'D'],
                    answer: 'A',
                },
                difficulty: 'easy',
                points: 10,
                timeLimit: 60,
                isActive: true,
                topicId: topic.id,
                lesson: lesson, // Asignar el objeto Lesson
                tags: ['tag1', 'tag2', `lesson-${lesson.id}`],
                timesCompleted: 0,
                averageScore: 0,
            });
        }

        console.time('ExerciseSeeder - insert exercises');
        // Usar save para que TypeORM maneje la relación con Lesson
        await exerciseRepository.save(exerciseData);
        console.timeEnd('ExerciseSeeder - insert exercises');
        console.log('Exercise seeder finished.');
    }
}
