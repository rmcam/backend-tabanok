import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { CulturalContent } from '../../features/cultural-content/cultural-content.entity';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export class CulturalContentSeeder extends DataSourceAwareSeed {
    constructor(dataSource: DataSource) {
        super(dataSource);
    }

    async run(): Promise<void> {
        const culturalContentRepository = this.dataSource.getRepository(CulturalContent);
        const culturalContentJsonPath = path.resolve(__dirname, '../files/json/cultural_content.json');

        try {
            const culturalContentJsonContent = JSON.parse(fs.readFileSync(culturalContentJsonPath, 'utf-8'));

            for (const contentData of culturalContentJsonContent) {
                const existingContent = await culturalContentRepository.findOne({ where: { title: contentData.title } });

                if (!existingContent) {
                    const newContent = culturalContentRepository.create({
                        id: uuidv4(),
                        title: contentData.title,
                        description: contentData.description,
                        category: contentData.category,
                        content: contentData.content,
                        mediaUrls: contentData.mediaUrls,
                    });
                    await culturalContentRepository.save(newContent);
                    console.log(`Cultural Content "${contentData.title}" seeded.`);
                } else {
                    console.log(`Cultural Content with title "${contentData.title}" already exists. Skipping.`);
                }
            }
            console.log('CulturalContent seeder finished.');
        } catch (error) {
            console.error('Error seeding cultural content:', error);
        }
    }
}
