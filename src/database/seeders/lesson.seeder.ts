import * as fs from 'fs';
import * as path from 'path';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { DataSource } from 'typeorm';
import { Lesson } from '../../features/lesson/entities/lesson.entity';
import { Unity } from '../../features/unity/entities/unity.entity';

export class LessonSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const lessonRepository = this.dataSource.getRepository(Lesson);
    const unityRepository = this.dataSource.getRepository(Unity);
    const additionalLessonsPath = path.resolve(__dirname, '../files/json/additional_lessons.json');

    try {
      const additionalLessonsContent = JSON.parse(fs.readFileSync(additionalLessonsPath, 'utf-8'));

      for (const lessonData of additionalLessonsContent) {
        const unity = await unityRepository.findOne({ where: { title: lessonData.unityTitle } });

        if (!unity) {
          console.log(`Unity with title "${lessonData.unityTitle}" not found. Skipping lesson "${lessonData.title}".`);
          continue;
        }

        const existingLesson = await lessonRepository.findOne({ where: { title: lessonData.title } });

        if (!existingLesson) {
          const newLesson = lessonRepository.create({
            title: lessonData.title,
            description: lessonData.description,
            unity: unity,
            unityId: unity.id,
          });
          await lessonRepository.save(newLesson);
          console.log(`Lesson "${lessonData.title}" seeded.`);
        } else {
          console.log(`Lesson "${lessonData.title}" already exists. Skipping.`);
        }
      }
    } catch (error) {
      console.error('Error seeding lessons:', error);
    }
  }
}
