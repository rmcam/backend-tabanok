import { DataSource } from 'typeorm';
import { In, Raw } from 'typeorm';
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
    const adminUsers = await userRepository.find({ where: { roles: Raw(alias => `${alias} @> ARRAY['${UserRole.ADMIN}']::users_roles_enum[]`) } });
    const teacherUsers = await userRepository.find({ where: { roles: Raw(alias => `${alias} @> ARRAY['${UserRole.TEACHER}']::users_roles_enum[]`) } });
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

    // Crear versiones iniciales (v1.0.0) para todo el contenido si no existen
    for (const content of contents) {
      const existingVersion = await contentVersionRepository.findOne({
        where: { contentId: String(content.id), majorVersion: 1, minorVersion: 0, patchVersion: 0 }
      });

      if (!existingVersion) {
        // Seleccionar un creador aleatorio
        const randomCreatorIndex = Math.floor(Math.random() * contentCreators.length);
        const creator = contentCreators[randomCreatorIndex];

        const initialVersion = contentVersionRepository.create({
              contentId: String(content.id),
              contentData: content.content,
              majorVersion: 1,
              minorVersion: 0,
              patchVersion: 0,
              status: Status.PUBLISHED,
              changeType: ChangeType.CREATION,
              metadata: { createdBy: creator.username, userId: creator.id, notes: 'Initial version of the content.' },
              validationStatus: { score: 100, validatedBy: 'system', validationDate: new Date() },
              createdAt: new Date(),
        });
        initialVersionsToSeed.push(initialVersion);
      } else {
        console.log(`Initial version for content ID "${content.id}" already exists. Skipping.`);
      }
    }

    // Guardar versiones iniciales
    try {
      await contentVersionRepository.save(initialVersionsToSeed);
      console.log(`Seeded ${initialVersionsToSeed.length} initial content versions.`);
    } catch (error) {
      console.error(`Error seeding initial content versions:`, error.message);
      throw error;
    }

    console.log('Content Version seeding complete.');
  }
}
