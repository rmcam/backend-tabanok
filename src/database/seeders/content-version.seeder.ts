
import { DataSource } from 'typeorm';
import { ContentVersion } from '../../features/content-versioning/entities/content-version.entity';
import { Content } from '../../features/content/entities/content.entity';
import { Status } from '../../common/enums/status.enum'; // Importar Status enum
import { ChangeType } from '../../features/content-versioning/enums/change-type.enum'; // Asumo que existe este enum
import { User } from '../../auth/entities/user.entity'; // Importar User
import { UserRole } from '../../auth/enums/auth.enum'; // Importar UserRole
import { DataSourceAwareSeed } from './data-source-aware-seed';

export class ContentVersionSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const contentVersionRepository = this.dataSource.getRepository(ContentVersion);
    const contentRepository = this.dataSource.getRepository(Content);
    const userRepository = this.dataSource.getRepository(User); // Obtener repositorio de User

    const contents = await contentRepository.find();
    const adminUsers = await userRepository.find({ where: { role: UserRole.ADMIN } });
    const teacherUsers = await userRepository.find({ where: { role: UserRole.TEACHER } });
    const contentCreators = [...adminUsers, ...teacherUsers];


    if (contents.length === 0) {
      console.log('No content found. Skipping ContentVersionSeeder.');
      return;
    }

     if (contentCreators.length === 0) {
        console.log('No admin or teacher users found. Skipping ContentVersionSeeder.');
        return;
    }


    const initialVersionsToSeed: ContentVersion[] = [];

    // First pass: Create initial versions (v1.0.0) for all content
    for (const content of contents) {
      const creator = contentCreators[Math.floor(Math.random() * contentCreators.length)]; // Asignar un creador aleatorio

      const initialVersion = contentVersionRepository.create({
        contentId: String(content.id), // Use contentId as string
        contentData: content.content, // Usar el contenido de la entidad Content
        majorVersion: 1,
        minorVersion: 0,
        patchVersion: 0,
        status: Status.PUBLISHED,
        changeType: ChangeType.CREATION,
        metadata: { createdBy: creator.username, userId: creator.id, notes: 'Initial version of the content.' },
        validationStatus: { score: 100, validatedBy: 'system', validationDate: new Date() },
        createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Fecha de creación aleatoria en los últimos 30 días
      });
      initialVersionsToSeed.push(initialVersion);
    }

    // Save initial versions
    await contentVersionRepository.save(initialVersionsToSeed);
    console.log(`Seeded ${initialVersionsToSeed.length} initial content versions.`);


    const subsequentVersionsToSeed: ContentVersion[] = [];

    // Second pass: Create subsequent versions based on initial versions
    for (const initialVersion of initialVersionsToSeed) {
        const numVersions = 3; // 3 additional versions per content
    let previousVersion = initialVersion;

        // Fetch the original content entity
        const originalContent = await contentRepository.findOne({ where: { id: initialVersion.contentId as any } });

        if (!originalContent) {
            console.warn(`Original content with ID ${initialVersion.contentId} not found. Skipping subsequent versions.`);
            continue; // Skip to the next initial version if original content is not found
        }


        for (let i = 0; i < numVersions; i++) {
            const modifier = contentCreators[Math.floor(Math.random() * contentCreators.length)];

            let major = previousVersion.majorVersion;
            let minor = previousVersion.minorVersion;
            let patch = previousVersion.patchVersion;
            let status = Status.DRAFT;
            let changeType = ChangeType.MODIFICATION;
            let notes = 'Content update.';
            let validationStatus = null;
            let contentData = { ...previousVersion.contentData, modified: `update_${i + 1}` }; // Simulate modification based on previous version's data

            // Randomly decide the type of version update
            const updateType = Math.random();
            if (updateType < 0.6) { // Minor update (60% chance)
                minor += 1;
                patch = 0;
                status = Math.random() < 0.8 ? Status.REVIEW : Status.DRAFT; // Mostly review or draft
                notes = 'Minor content revision.';
                validationStatus = status === Status.REVIEW ? { score: Math.floor(Math.random() * 30) + 70, validatedBy: 'reviewer' + Math.floor(Math.random() * 5 + 1), validationDate: new Date() } : null; // Score 70-99 for review
            } else if (updateType < 0.9) { // Patch update (30% chance)
                patch += 1;
                status = Math.random() < 0.9 ? Status.PUBLISHED : Status.INACTIVE; // Mostly published or inactive (using INACTIVE instead of REJECTED)
                notes = 'Correction or small fix.';
                validationStatus = status === Status.PUBLISHED ? { score: Math.floor(Math.random() * 5) + 95, validatedBy: 'reviewer' + Math.floor(Math.random() * 5 + 1), validationDate: new Date() } : (status === Status.INACTIVE ? { score: Math.floor(Math.random() * 40), validatedBy: 'reviewer' + Math.floor(Math.random() * 5 + 1), validationDate: new Date() } : null); // Score 95-100 for published, 0-39 for inactive
            } else { // Major update (10% chance)
                major += 1;
                minor = 0;
                patch = 0;
                status = Math.random() < 0.5 ? Status.DRAFT : Status.REVIEW; // Draft or review
                changeType = ChangeType.MODIFICATION; // Still MODIFICATION as per enum
                notes = 'Major content overhaul.';
                validationStatus = status === Status.REVIEW ? { score: Math.floor(Math.random() * 30) + 60, validatedBy: 'reviewer' + Math.floor(Math.random() * 5 + 1), validationDate: new Date() } : null; // Score 60-89 for major review
            }

            // Simulate content modification based on type for better realism
            // This part needs to be more sophisticated based on actual content structure
            if (originalContent.type === 'texto' && typeof previousVersion.contentData === 'object' && Array.isArray(previousVersion.contentData)) {
                contentData = { ...previousVersion.contentData };
                if (contentData.length > 0) {
                    const randomIndex = Math.floor(Math.random() * contentData.length);
                    if (contentData[randomIndex].descripcion) {
                        contentData[randomIndex].descripcion += ' (modified)';
                    } else if (contentData[randomIndex].contenido) {
                         contentData[randomIndex].contenido += ' (modified)';
                    }
                }
            } else if (originalContent.type === 'diccionario' && typeof previousVersion.contentData === 'object') {
                 contentData = { ...previousVersion.contentData };
                 if (contentData.significados && contentData.significados.length > 0) {
                     const randomIndex = Math.floor(Math.random() * contentData.significados.length);
                     contentData.significados[randomIndex].definicion += ' (mod)';
                 } else if (contentData.equivalentes && contentData.equivalentes.length > 0) {
                      const randomIndex = Math.floor(Math.random() * contentData.equivalentes.length);
                      contentData.equivalentes[randomIndex].palabra += ' (mod)';
                 }
            }
            // Add more specific content modification logic for other types as needed


            const newVersion = contentVersionRepository.create({
              contentId: String(originalContent.id), // Associate with the original content using ID as string
              contentData: contentData,
              majorVersion: major,
              minorVersion: minor,
              patchVersion: patch,
              status: status,
              changeType: changeType,
              metadata: { updatedBy: modifier.username, userId: modifier.id, notes: notes },
              validationStatus: validationStatus,
              createdAt: new Date(previousVersion.createdAt.getTime() + Math.random() * 10 * 24 * 60 * 60 * 1000), // Created after previous version
            });
            subsequentVersionsToSeed.push(newVersion);
            previousVersion = newVersion; // Update previous version for the next iteration
        }
    }

    // Save subsequent versions
    await contentVersionRepository.save(subsequentVersionsToSeed);
    console.log(`Seeded ${subsequentVersionsToSeed.length} subsequent content versions.`);

    console.log('Content Version seeding complete.');
  }
}
