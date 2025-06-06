import { DataSource } from 'typeorm';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import { Content } from '../../features/content/entities/content.entity';
import { Multimedia } from '../../features/multimedia/entities/multimedia.entity';
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

    // Crear un número fijo de relaciones entre contenido y multimedia si no existen
    const relationsToSeed: { contentId: string; multimediaId: string }[] = [];
    const maxRelationsPerContent = 1; // Limitar a 1 relación por contenido para inicialización

    for (const content of contents) {
        // Seleccionar un elemento multimedia aleatorio
        const randomIndex = Math.floor(Math.random() * multimediaItems.length);
        const multimediaToLink = multimediaItems[randomIndex];

        if (multimediaToLink) {
            // Verificar si la relación ya existe
            const existingRelation = await this.dataSource.query(
                `SELECT 1 FROM "content_multimedia" WHERE "content_id" = $1 AND "multimedia_id" = $2`,
                [content.id, multimediaToLink.id]
            );

            if (existingRelation.length === 0) {
                relationsToSeed.push({
                    contentId: content.id,
                    multimediaId: multimediaToLink.id,
                });
            } else {
                console.log(`Relation between Content ID ${content.id} and Multimedia ID ${multimediaToLink.id} already exists. Skipping.`);
            }
        } else {
            console.warn(`No multimedia item available to link to Content ID ${content.id}.`);
        }
    }

    if (relationsToSeed.length > 0) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            for (const relation of relationsToSeed) {
                await queryRunner.query(
                    `INSERT INTO "content_multimedia" ("content_id", "multimedia_id") VALUES ($1, $2)`,
                    [relation.contentId, relation.multimediaId]
                );
                console.log(`Linked Content ID ${relation.contentId} with Multimedia ID ${relation.multimediaId}`);
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
    } else {
        console.log('No new ContentMultimedia relations to seed.');
    }
  }
}
