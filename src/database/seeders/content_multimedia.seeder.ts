import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { Content } from '../../features/content/entities/content.entity';
import { Multimedia } from '../../features/multimedia/entities/multimedia.entity';
import { randomInt } from 'crypto';

export class ContentMultimediaSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    console.log('Running ContentMultimediaSeeder...');
    const contentRepository = this.dataSource.getRepository(Content);
    const multimediaRepository = this.dataSource.getRepository(Multimedia);

    const contents = await contentRepository.find();
    const multimediaItems = await multimediaRepository.find();

    if (contents.length === 0 || multimediaItems.length === 0) {
      console.log('No contents or multimedia found. Skipping ContentMultimediaSeeder.');
      return;
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Clear existing relations to avoid duplicates on re-seeding
      await queryRunner.query('TRUNCATE TABLE "content_multimedia" CASCADE;');
      console.log('Truncated table: content_multimedia');

      for (const content of contents) {
        // Link each content to a random number of multimedia items (e.g., 1 to 3)
        const numberOfMultimediaToLink = randomInt(1, 4); // 1 to 3 inclusive
        const linkedMultimediaIds: number[] = [];

        for (let i = 0; i < numberOfMultimediaToLink; i++) {
          // Select a random multimedia item that hasn't been linked to this content yet
          let randomMultimedia: Multimedia | undefined;
          let attempts = 0;
          do {
            const randomIndex = randomInt(0, multimediaItems.length);
            randomMultimedia = multimediaItems[randomIndex];
            attempts++;
          } while (linkedMultimediaIds.includes(randomMultimedia.id) && attempts < 10); // Avoid infinite loop

          if (randomMultimedia && !linkedMultimediaIds.includes(randomMultimedia.id)) {
            await queryRunner.query(
              `INSERT INTO "content_multimedia" ("content_id", "multimedia_id") VALUES ($1, $2)`,
              [content.id, randomMultimedia.id]
            );
            linkedMultimediaIds.push(randomMultimedia.id);
            console.log(`Linked Content ID ${content.id} with Multimedia ID ${randomMultimedia.id}`);
          } else if (attempts >= 10) {
              console.warn(`Could not find a unique multimedia item to link to Content ID ${content.id} after 10 attempts.`);
          }
        }
      }

      await queryRunner.commitTransaction();
      console.log('ContentMultimedia seeding complete.');

    } catch (error) {
      await queryRunner.rollbackTransaction();
      console.error('ContentMultimedia seeding failed. Transaction rolled back.', error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}