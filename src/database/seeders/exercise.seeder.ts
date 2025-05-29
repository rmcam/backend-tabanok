import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { Exercise } from '../../features/exercises/entities/exercise.entity';
import { Topic } from '../../features/topic/entities/topic.entity';
import { v4 as uuidv4 } from 'uuid';
import { Lesson } from '../../features/lesson/entities/lesson.entity'; // Import Lesson entity

export class ExerciseSeeder extends DataSourceAwareSeed {
    constructor(dataSource: DataSource) {
        super(dataSource);
    }

    async run(): Promise<void> {
        console.log('Running ExerciseSeeder...');
        const exerciseRepository = this.dataSource.getRepository(Exercise);
        const topicRepository = this.dataSource.getRepository(Topic);
        const lessonRepository = this.dataSource.getRepository(Lesson); // Get Lesson repository

        // Clear existing exercises to prevent conflicts
        console.log('[ExerciseSeeder] Clearing existing exercises...');
        await exerciseRepository.clear(); // Use clear() for a cleaner reset
        console.log('[ExerciseSeeder] Existing exercises cleared.');

        const topics = await topicRepository.find();
        const lessons = await lessonRepository.find(); // Fetch all lessons

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
                topicId: topic.id,
                lesson: lesson, // Assign the lesson object directly
                tags: ['tag1', 'tag2'],
                timesCompleted: 0,
                averageScore: 0,
            });
        }

        console.time('ExerciseSeeder - insert exercises');
        await this.dataSource
            .createQueryBuilder()
            .insert()
            .into(Exercise)
            .values(exerciseData)
            .execute();
        console.timeEnd('ExerciseSeeder - insert exercises');
        console.log('Exercise seeder finished.');
    }
}
