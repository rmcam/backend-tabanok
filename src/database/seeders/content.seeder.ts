import { DataSource } from 'typeorm';
import { Content } from '../../features/content/entities/content.entity';
import { Topic } from '../../features/topic/entities/topic.entity';
import { Unity } from '../../features/unity/entities/unity.entity';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import * as fs from 'fs';
import * as path from 'path';

export class ContentSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const contentRepository = this.dataSource.getRepository(Content);
    const unityRepository = this.dataSource.getRepository(Unity);
    const topicRepository = this.dataSource.getRepository(Topic);
    const culturalContentPath = path.resolve(__dirname, '../files/json/cultural_content.json');

    try {
      const culturalContent = JSON.parse(fs.readFileSync(culturalContentPath, 'utf-8'));

      for (const contentData of culturalContent) {
        const unity = await unityRepository.findOne({ where: { title: contentData.unityTitle } });
        const topic = await topicRepository.findOne({ where: { title: contentData.topicTitle } });

        if (!unity) {
          console.warn(`Unity with title "${contentData.unityTitle}" not found. Skipping content "${contentData.title}".`);
          continue;
        }

        if (!topic) {
          console.warn(`Topic with title "${contentData.topicTitle}" not found. Skipping content "${contentData.title}".`);
          continue;
        }

        const existingContent = await contentRepository.findOne({ where: { title: contentData.title } });

        if (!existingContent) {
          const newContent = contentRepository.create({
            title: contentData.title,
            description: contentData.description,
            type: contentData.type,
            content: contentData.content,
            unity: unity,
            unityId: unity.id,
            topic: topic,
            topicId: topic.id,
            order: contentData.order,
          });
          await contentRepository.save(newContent);
          console.log(`Content "${contentData.title}" seeded.`);
        } else {
          console.log(`Content "${contentData.title}" already exists. Skipping.`);
        }
      }
      console.log('Content seeder finished.');
    } catch (error) {
      console.error('Error seeding content:', error);
    }
  }
}
