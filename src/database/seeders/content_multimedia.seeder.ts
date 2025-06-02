import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { Content } from '../../features/content/entities/content.entity';
import { Multimedia } from '../../features/multimedia/entities/multimedia.entity';
import * as fs from 'fs';
import * as path from 'path';

export class ContentMultimediaSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const contentRepository = this.dataSource.getRepository(Content);
    const multimediaRepository = this.dataSource.getRepository(Multimedia);
    const relationsJsonPath = path.resolve(__dirname, '../files/json/content_multimedia_relations.json');

    try {
      const relationsJsonContent = JSON.parse(fs.readFileSync(relationsJsonPath, 'utf-8'));

      for (const relationData of relationsJsonContent) {
        const content = await contentRepository.findOne({ where: { id: relationData.contentId } });

        if (!content) {
          console.warn(`Content with ID ${relationData.contentId} not found. Skipping.`);
          continue;
        }

        for (const multimediaId of relationData.multimediaIds) {
          const multimedia = await multimediaRepository.findOne({ where: { id: multimediaId } });

          if (!multimedia) {
            console.warn(`Multimedia with ID ${multimediaId} not found. Skipping.`);
            continue;
          }

          await contentRepository.createQueryBuilder()
            .relation(Content, "multimedia")
            .of(content)
            .add(multimedia);
          console.log(`Linked Content ID ${content.id} with Multimedia ID ${multimedia.id}`);
        }
      }
      console.log('ContentMultimedia seeding complete.');
    } catch (error) {
      console.error('Error seeding content multimedia relations:', error);
    }
  }
}
