import { DataSource } from 'typeorm';
import { ContentVersion } from '../../features/content-versioning/entities/content-version.entity';
import { Content } from '../../features/content/entities/content.entity';
import { User } from '../../auth/entities/user.entity';
import { DataSourceAwareSeed } from './data-source-aware-seed';
import * as fs from 'fs';
import * as path from 'path';
import { Status } from '../../common/enums/status.enum';
import { ChangeType } from '../../features/content-versioning/enums/change-type.enum';
import { v4 as uuidv4 } from 'uuid';

export class ContentVersionSeeder extends DataSourceAwareSeed {
  constructor(dataSource: DataSource) {
    super(dataSource);
  }

  async run(): Promise<void> {
    const contentVersionRepository = this.dataSource.getRepository(ContentVersion);
    const contentRepository = this.dataSource.getRepository(Content);
    const userRepository = this.dataSource.getRepository(User);
    const contentVersionsJsonPath = path.resolve(__dirname, '../files/json/content_versions.json');

    try {
      const contentVersionsJsonContent = JSON.parse(fs.readFileSync(contentVersionsJsonPath, 'utf-8'));

      for (const versionData of contentVersionsJsonContent) {
        const content = await contentRepository.findOne({ where: { id: versionData.contentId } });

        if (!content) {
          console.warn(`Content with ID ${versionData.contentId} not found. Skipping.`);
          continue;
        }

        let user: User | null = null;
        if (versionData.metadata && versionData.metadata.userId) {
          user = await userRepository.findOne({ where: { id: versionData.metadata.userId } });
        } else if (versionData.metadata && versionData.metadata.createdBy) {
          user = await userRepository.findOne({ where: { username: versionData.metadata.createdBy } });
        } else if (versionData.metadata && versionData.metadata.updatedBy) {
          user = await userRepository.findOne({ where: { username: versionData.metadata.updatedBy } });
        }

        if (!user) {
          console.warn(`User for content version (contentId: ${versionData.contentId}, version: ${versionData.majorVersion}.${versionData.minorVersion}.${versionData.patchVersion}) not found. Skipping.`);
          continue;
        }

        const existingVersion = await contentVersionRepository.findOne({
          where: {
            contentId: String(content.id),
            majorVersion: versionData.majorVersion,
            minorVersion: versionData.minorVersion,
            patchVersion: versionData.patchVersion,
          },
        });

        if (!existingVersion) {
          const newVersion = contentVersionRepository.create({
            id: uuidv4(),
            contentId: String(content.id),
            contentData: versionData.contentData,
            majorVersion: versionData.majorVersion,
            minorVersion: versionData.minorVersion,
            patchVersion: versionData.patchVersion,
            status: versionData.status as Status,
            changeType: versionData.changeType as ChangeType,
            metadata: {
              ...versionData.metadata,
              userId: user.id,
              createdBy: versionData.metadata.createdBy || user.username,
              updatedBy: versionData.metadata.updatedBy || user.username,
            },
            validationStatus: versionData.validationStatus,
            createdAt: new Date(versionData.createdAt),
          });
          await contentVersionRepository.save(newVersion);
          console.log(`Content Version for content ID "${content.id}" (v${versionData.majorVersion}.${versionData.minorVersion}.${versionData.patchVersion}) seeded.`);
        } else {
          console.log(`Content Version for content ID "${content.id}" (v${versionData.majorVersion}.${versionData.minorVersion}.${versionData.patchVersion}) already exists. Skipping.`);
        }
      }
      console.log('Content Version seeding complete.');
    } catch (error) {
      console.error('Error seeding content versions:', error);
    }
  }
}
