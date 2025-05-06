import { DataSourceAwareSeed } from './index';
import { DataSource } from 'typeorm';
import { ContentVersion } from '../../features/content-versioning/entities/content-version.entity';
import { Content } from '../../features/content/entities/content.entity';
import { Status } from '../../common/enums/status.enum'; // Importar Status enum
import { ChangeType } from '../../features/content-versioning/enums/change-type.enum'; // Asumo que existe este enum

export class ContentVersionSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const contentVersionRepository = this.dataSource.getRepository(ContentVersion);
    const contentRepository = this.dataSource.getRepository(Content);

    const contents = await contentRepository.find();

    if (contents.length === 0) {
      console.log('No content found. Skipping ContentVersionSeeder.');
      return;
    }

    const contentVersionsToSeed = [];

    // Crear versiones para cada contenido existente
    for (const content of contents) {
      // Versión inicial (v1.0.0)
      contentVersionsToSeed.push({
        content: content,
        contentId: content.id,
        contentData: content.content, // Usar el contenido de la entidad Content
        majorVersion: 1,
        minorVersion: 0,
        patchVersion: 0,
        status: Status.PUBLISHED, // Usar un estado apropiado, ej. PUBLISHED
        changeType: ChangeType.CREATION, // Usar CREATION para la versión inicial
        metadata: { createdBy: 'seeder' },
      });

      // Agregar una versión de ejemplo posterior (v1.1.0)
      contentVersionsToSeed.push({
        content: content,
        contentId: content.id,
        contentData: { ...content.content, updated: true }, // Modificar el contenido de ejemplo
        majorVersion: 1,
        minorVersion: 1,
        patchVersion: 0,
        status: Status.REVIEW, // Usar un estado apropiado, ej. REVIEW
        changeType: ChangeType.MODIFICATION, // Usar MODIFICATION para una actualización
        metadata: { updatedBy: 'seeder', notes: 'Minor update' },
      });
    }


    for (const versionData of contentVersionsToSeed) {
      // Buscar si ya existe una versión con el mismo contentId y número de versión
      const existingVersion = await contentVersionRepository.findOne({
        where: {
          content: { id: versionData.contentId },
          majorVersion: versionData.majorVersion,
          minorVersion: versionData.minorVersion,
          patchVersion: versionData.patchVersion,
        } as any, // Usar 'as any' temporalmente si hay problemas de tipo con la condición where
        relations: ['content'], // Cargar explícitamente la relación content
      });

      if (!existingVersion) {
        const newVersion = contentVersionRepository.create(versionData);
        await contentVersionRepository.save(newVersion);
        console.log(`Content Version ${versionData.majorVersion}.${versionData.minorVersion}.${versionData.patchVersion} for Content ID ${versionData.contentId} seeded.`);
      } else {
        console.log(`Content Version ${existingVersion.majorVersion}.${existingVersion.minorVersion}.${existingVersion.patchVersion} for Content ID ${existingVersion.content.id} already exists. Skipping.`);
      }
    }
  }
}
