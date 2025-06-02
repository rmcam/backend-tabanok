import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { Exercise } from '../../features/exercises/entities/exercise.entity';
import { Topic } from '../../features/topic/entities/topic.entity';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

export class ExerciseSeeder extends DataSourceAwareSeed {
    constructor(dataSource: DataSource) {
        super(dataSource);
    }

    async run(): Promise<void> {
        console.log('Running ExerciseSeeder...');
        const exerciseRepository = this.dataSource.getRepository(Exercise);
        const topicRepository = this.dataSource.getRepository(Topic);

        const exercisesJsonPath = path.resolve(__dirname, '../files/json/exercises.json');
        const exercisesJsonContent = JSON.parse(fs.readFileSync(exercisesJsonPath, 'utf-8'));

        const exercisesToInsert: Exercise[] = [];

        for (const exerciseData of exercisesJsonContent) {
            const topic = await topicRepository.findOne({ where: { title: exerciseData.topicTitle } });

            if (!topic) {
                console.warn(`Topic with title "${exerciseData.topicTitle}" not found for exercise "${exerciseData.title}". Skipping.`);
                continue;
            }

            const existingExercise = await exerciseRepository.findOne({ where: { title: exerciseData.title, topic: { id: topic.id } } });

            if (!existingExercise) {
                exercisesToInsert.push(
                    exerciseRepository.create({
                        id: uuidv4(),
                        title: exerciseData.title,
                        description: exerciseData.description,
                        type: exerciseData.type,
                        content: exerciseData.content,
                        difficulty: exerciseData.difficulty,
                        points: exerciseData.points,
                        timeLimit: exerciseData.timeLimit,
                        isActive: exerciseData.isActive,
                        topic: topic,
                        topicId: topic.id,
                        tags: exerciseData.tags,
                        timesCompleted: exerciseData.timesCompleted || 0,
                        averageScore: exerciseData.averageScore || 0,
                    }),
                );
            } else {
                console.log(`Exercise "${existingExercise.title}" for topic "${topic.title}" already exists. Skipping.`);
            }
        }

        await exerciseRepository.save(exercisesToInsert);
        console.log(`Seeded ${exercisesToInsert.length} new exercises.`);
        console.log('Exercise seeder finished.');
    }
}
