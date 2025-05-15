import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { Exercise } from '../../features/exercises/entities/exercise.entity';
import { Topic } from '../../features/topic/entities/topic.entity';
import { v4 as uuidv4 } from 'uuid';

export class ExerciseSeeder extends DataSourceAwareSeed {
    constructor(dataSource: DataSource) {
        super(dataSource);
    }

    async run(): Promise<void> {
        console.log('Running ExerciseSeeder...');
        const exerciseRepository = this.dataSource.getRepository(Exercise);
        const topicRepository = this.dataSource.getRepository(Topic);

        const topics = await topicRepository.find();

        if (topics.length === 0) {
            console.warn('No topics found. Skipping ExerciseSeeder.');
            return;
        }

        const exerciseData = [];

        for (let i = 0; i < 5; i++) {
            const topic = topics[i % topics.length]; // Cycle through topics if needed

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
                topic: topic,
                tags: ['tag1', 'tag2'],
                timesCompleted: 0,
                averageScore: 0,
            });
        }

        await exerciseRepository.save(exerciseData);
        console.log('Exercise seeder finished.');
    }
}
