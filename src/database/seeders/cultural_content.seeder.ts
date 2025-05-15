import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { CulturalContent } from '../../features/cultural-content/cultural-content.entity';
import { v4 as uuidv4 } from 'uuid';

export class CulturalContentSeeder extends DataSourceAwareSeed {
    constructor(dataSource: DataSource) {
        super(dataSource);
    }

    async run(): Promise<void> {
        console.log('Running CulturalContentSeeder...');
        const culturalContentRepository = this.dataSource.getRepository(CulturalContent);

        const culturalContentData = [];

        for (let i = 0; i < 5; i++) {
            culturalContentData.push({
                id: uuidv4(),
                title: `Cultural Content ${i}`,
                description: `Description of cultural content ${i}`,
                category: 'general',
                content: `This is the content for cultural content ${i}`,
                mediaUrls: [
                    `http://example.com/media${i}.jpg`,
                    `http://example.com/media${i+1}.mp4`
                ],
            });
        }

        await culturalContentRepository.save(culturalContentData);
        console.log('CulturalContent seeder finished.');
    }
}