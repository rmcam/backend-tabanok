import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm"; // Import DataSource
import { CreateVersionDto } from "./dto/create-version.dto";
import { UpdateVersionDto } from "./dto/update-version.dto";
import { ContentVersion } from "./entities/content-version.entity";
import { ChangeType, ContentDiff } from "./interfaces/content-version.interface";
import { Status } from "../../common/enums/status.enum";

@Injectable()
export class ContentVersioningService {
  constructor(
    @InjectRepository(ContentVersion)
    private readonly versionRepository: Repository<ContentVersion>,
    private dataSource: DataSource // Inject DataSource
  ) {}

  async create(createVersionDto: CreateVersionDto): Promise<ContentVersion> {
    const version = new ContentVersion();
    Object.assign(version, {
      ...createVersionDto,
      status: Status.DRAFT,
      changeType: ChangeType.CREATION,
      // Removed changes property
      metadata: {
        tags: [],
        author: createVersionDto.metadata.author,
        reviewers: [],
        validatedBy: "",
        createdAt: new Date(),
      },
      validationStatus: {
        culturalAccuracy: 0,
        linguisticQuality: 0,
        communityApproval: false,
        isValidated: false,
        score: 0,
        dialectConsistency: 0,
        feedback: [],
      },
      // Removed relatedVersions, changelog, isLatest, hasConflicts properties
    });

    return this.versionRepository.save(version);
  }

  async findAll(): Promise<ContentVersion[]> {
    return this.versionRepository.find();
  }

  async findOne(id: string): Promise<ContentVersion> {
    const version = await this.versionRepository.findOne({ where: { id } });
    if (!version) {
      throw new NotFoundException(`Versión ${id} no encontrada`);
    }
    return version;
  }

  async update(
    id: string,
    updateVersionDto: UpdateVersionDto
  ): Promise<ContentVersion> {
    const version = await this.findOne(id);
    Object.assign(version, {
      ...updateVersionDto,
      metadata: {
        ...version.metadata,
        ...updateVersionDto.metadata,
        modifiedAt: new Date(),
      },
    });
    return this.versionRepository.save(version);
  }

  async remove(id: string): Promise<void> {
    const version = await this.findOne(id);
    await this.versionRepository.remove(version);
  }

  async findByContentId(contentId: string): Promise<ContentVersion[]> {
    return this.versionRepository.find({
      where: { contentId },
      // Removed order by versionNumber
    });
  }

  async findLatestVersion(contentId: string): Promise<ContentVersion> {
    // Finding the latest version requires ordering by major, minor, patch
    const versions = await this.versionRepository.find({
      where: { contentId },
      order: { majorVersion: "DESC", minorVersion: "DESC", patchVersion: "DESC" },
      take: 1, // Take only the first result (the latest)
    });

    if (!versions || versions.length === 0) {
      throw new NotFoundException(
        `No se encontró una versión para el contenido ${contentId}`
      );
    }
    return versions[0];
  }

  async mergeVersions(
    sourceId: string,
    targetId: string
  ): Promise<ContentVersion> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const source = await queryRunner.manager.findOne(ContentVersion, { where: { id: sourceId } });
      const target = await queryRunner.manager.findOne(ContentVersion, { where: { id: targetId } });

      if (!source || !target) {
        throw new NotFoundException("Versión de origen o destino no encontrada");
      }

      const mergedVersion = new ContentVersion();
      Object.assign(mergedVersion, {
        contentId: target.contentId,
        // Removed versionNumber
        majorVersion: target.majorVersion,
        minorVersion: target.minorVersion + 1, // Increment minor version for merge
        patchVersion: 0, // Reset patch version for merge
        status: Status.DRAFT,
        changeType: ChangeType.MERGE, // Changed changeType to MERGE
        contentData: { // Changed 'content' to 'contentData'
          ...target.contentData, // Changed 'content' to 'contentData'
          ...source.contentData, // Changed 'content' to 'contentData'
        },
        metadata: {
          ...target.metadata,
          modifiedAt: new Date(),
          // Added comment for merge
          comments: [...(target.metadata.comments || []), `Merged version ${source.majorVersion}.${source.minorVersion}.${source.patchVersion} into version ${target.majorVersion}.${target.minorVersion}.${target.patchVersion}`],
        },
        validationStatus: {
          culturalAccuracy: 0,
          linguisticQuality: 0,
          communityApproval: false,
          isValidated: false,
          score: 0,
          dialectConsistency: 0,
          feedback: [],
        },
        // Removed previousVersion, isLatest, hasConflicts, relatedVersions, changelog
      });

      // Note: The concept of 'latest' and 'previous/next' versions needs to be managed by querying,
      // as these properties are not in the entity. The update calls below are likely incorrect
      // Marcar las versiones de origen y destino como no latest
      await queryRunner.manager.save(target);
      await queryRunner.manager.save(source);

      const savedMergedVersion = await queryRunner.manager.save(mergedVersion);

      await queryRunner.commitTransaction();
      return savedMergedVersion;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async createVersion(
    contentId: string,
    contentData: any, // Changed 'content' type hint to 'contentData'
    author: string,
    changeType: ChangeType = ChangeType.CREATION
  ): Promise<ContentVersion> {
    // Finding the latest version requires ordering by major, minor, patch
    const latestVersion = await this.versionRepository.findOne({
      where: { contentId },
      order: { majorVersion: "DESC", minorVersion: "DESC", patchVersion: "DESC" },
    });

    const [major, minor, patch] = this.calculateVersionNumbers(
      changeType,
      latestVersion // Use latestVersion found above
    );

    const version = new ContentVersion();
    Object.assign(version, {
      contentId,
      // Removed versionNumber
      majorVersion: major,
      minorVersion: minor,
      patchVersion: patch,
      status: Status.DRAFT,
      changeType,
      contentData, // Changed 'content' to 'contentData'
      metadata: {
        author,
        reviewers: [],
        validatedBy: "",
        createdAt: new Date(),
        modifiedAt: new Date(),
        comments: [],
        tags: [],
      },
      validationStatus: {
        culturalAccuracy: 0,
        linguisticQuality: 0,
        communityApproval: false,
        isValidated: false,
        score: 0,
        dialectConsistency: 0,
        feedback: [],
      },
      // Removed changes, isLatest, hasConflicts, relatedVersions
    });

    // Removed logic related to previousVersion and nextVersion as they are not in entity
    // if (latestVersion) {
    //   await this.versionRepository.update(latestVersion.id, {
    //     nextVersion: version.id,
    //     isLatest: false,
    //   });
    // }

    return this.versionRepository.save(version);
  }

  private calculateVersionNumbers(
    changeType: ChangeType,
    previousVersion?: ContentVersion
  ): [number, number, number] {
    if (!previousVersion) return [1, 0, 0];

    const { majorVersion, minorVersion, patchVersion } = previousVersion;

    switch (changeType) {
      case ChangeType.CREATION:
        // If there is a previous version, increment the patch for a new version
        // This logic seems inconsistent with standard versioning (creation usually starts at 1.0.0 or increments major/minor).
        // Based on the entity, patch increments for minor changes. Let's adjust.
        return [majorVersion, minorVersion, patchVersion + 1]; // Increment patch for minor changes
      case ChangeType.MODIFICATION:
        return [majorVersion, minorVersion + 1, 0]; // Increment minor for modifications, reset patch
      case ChangeType.MERGE: // Added MERGE case
        return [majorVersion, minorVersion + 1, 0]; // Treat merge as a minor version increment
      case ChangeType.DELETION: // Added DELETION case
        return [majorVersion + 1, 0, 0]; // Treat deletion as a major version increment (example)
      case ChangeType.REVERT: // Added REVERT case
         return [majorVersion, minorVersion + 1, 0]; // Treat revert as a minor version increment (example)
      default:
        // Fallback for any other change type, increment patch
        return [majorVersion, minorVersion, patchVersion + 1];
    }
  }

  async updateVersion(
    id: string,
    updateVersionDto: UpdateVersionDto
  ): Promise<ContentVersion> {
    const version = await this.findOne(id);
    if (!version) {
      throw new NotFoundException(`Version with ID ${id} not found`);
    }

    // Actualizar los campos básicos
    Object.assign(version, {
      ...updateVersionDto,
      metadata: updateVersionDto.metadata || version.metadata,
      updatedAt: new Date(),
    });

    return this.versionRepository.save(version);
  }

  async createBranch(
    versionId: string,
    branchName: string, // branchName is not in the entity, this functionality might need re-evaluation
    author: string
  ): Promise<ContentVersion> {
    const baseVersion = await this.versionRepository.findOne({
      where: { id: versionId },
    });
    if (!baseVersion) {
      throw new NotFoundException(`Versión base ${versionId} no encontrada`);
    }

    // Creating a branch implies creating a new version based on an existing one.
    // The concept of 'branchName' and 'previous/next' versions is not directly supported
    // by the current ContentVersion entity structure.
    // This method's implementation needs to be reconsidered based on the intended workflow
    // and the actual entity properties (major, minor, patch, contentData, metadata, etc.).
    // For now, I will create a new version with incremented patch and a comment indicating it's a branch.

    const [major, minor, patch] = this.calculateVersionNumbers(
      ChangeType.CREATION, // Treat branch creation as a new version (patch increment)
      baseVersion
    );

    const branchVersion = this.versionRepository.create({
      ...baseVersion, // Copy data from base version
      id: undefined, // Generate new ID
      majorVersion: major, // Set new version numbers
      minorVersion: minor,
      patchVersion: patch,
      // Removed branchName, previousVersion, nextVersion, isLatest
      metadata: {
        ...baseVersion.metadata,
        author,
        createdAt: new Date(),
        modifiedAt: new Date(),
        // Added comment for branch creation
        comments: [...(baseVersion.metadata.comments || []), `Branch created from version ${baseVersion.majorVersion}.${baseVersion.minorVersion}.${baseVersion.patchVersion}`],
      },
      // Ensure contentData is copied
      contentData: baseVersion.contentData,
    });

    return this.versionRepository.save(branchVersion);
  }

  async mergeBranch(
    branchVersionId: string,
    targetVersionId: string,
    author: string
  ): Promise<ContentVersion> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const [branchVersion, targetVersion] = await Promise.all([
        queryRunner.manager.findOne(ContentVersion, { where: { id: branchVersionId } }),
        queryRunner.manager.findOne(ContentVersion, { where: { id: targetVersionId } }),
      ]);

      if (!branchVersion || !targetVersion) {
        throw new NotFoundException(
          "Versión de rama o versión objetivo no encontrada"
        );
      }

      // Merge logic using contentData
      const mergedContentData = this.mergeContents(
        branchVersion.contentData, // Changed type hint
        targetVersion.contentData // Changed type hint
      );

      const [major, minor, patch] = this.calculateVersionNumbers(
        ChangeType.MERGE, // Use MERGE change type
        targetVersion
      );

      const mergedVersion = new ContentVersion();
      Object.assign(mergedVersion, {
        contentId: targetVersion.contentId,
        // Removed versionNumber
        majorVersion: major,
        minorVersion: minor,
        patchVersion: patch,
        status: Status.DRAFT,
        changeType: ChangeType.MERGE, // Use MERGE change type
        contentData: mergedContentData, // Changed 'content' to 'contentData'
        // Removed previousVersion, isLatest, hasConflicts, relatedVersions
        metadata: {
          author,
          reviewers: [],
          validatedBy: "",
          createdAt: new Date(),
          modifiedAt: new Date(),
          // Added comment for merge
          comments: [...(targetVersion.metadata.comments || []), `Merged branch version ${branchVersion.majorVersion}.${branchVersion.minorVersion}.${branchVersion.patchVersion} into version ${targetVersion.majorVersion}.${targetVersion.minorVersion}.${targetVersion.patchVersion}`],
          tags: [
            ...new Set([
              ...(targetVersion.metadata.tags || []), // Handle potential undefined tags
              ...(branchVersion.metadata.tags || []), // Handle potential undefined tags
            ]),
          ],
        },
        validationStatus: {
          culturalAccuracy: 0,
          linguisticQuality: 0,
          communityApproval: false,
          isValidated: false,
          score: 0,
          dialectConsistency: 0,
          feedback: [],
        },
        // Removed changes
      });

      // Removed update calls related to isLatest and nextVersion

      const savedMergedVersion = await queryRunner.manager.save(mergedVersion);

      await queryRunner.commitTransaction();
      return savedMergedVersion;

    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  private mergeContents(
    branchContentData: any, // Changed type hint
    targetContentData: any // Changed type hint
  ): any { // Changed return type hint
    // Implementar lógica de fusión más sofisticada según necesidades
    // Assuming contentData is an object with properties like original, translated, culturalContext, etc.
    return {
      ...targetContentData,
      ...branchContentData,
      // Example: Concatenate culturalContext if they are strings or arrays
      culturalContext: Array.isArray(targetContentData?.culturalContext) && Array.isArray(branchContentData?.culturalContext)
        ? [...targetContentData.culturalContext, ...branchContentData.culturalContext].filter(Boolean)
        : (targetContentData?.culturalContext || branchContentData?.culturalContext),
      // Add more specific merge logic for other properties in contentData if needed
    };
  }

  async publishVersion(
    versionId: string,
    author: string
  ): Promise<ContentVersion> {
    const version = await this.versionRepository.findOne({
      where: { id: versionId },
    });
    if (!version) {
      throw new NotFoundException(`Versión ${versionId} no encontrada`);
    }

    if (!version.validationStatus?.isValidated) { // Added optional chaining
      throw new BadRequestException(
        "La versión debe ser validada antes de publicar"
      );
    }

    version.status = Status.PUBLISHED;
    // metadata might be null, check before accessing properties
    if (!version.metadata) {
        version.metadata = {};
    }
    version.metadata.publishedAt = new Date();
    // Removed changelog push
    // version.changelog.push({
    //   date: new Date(),
    //   author,
    //   description: "Versión publicada",
    //   type: ChangeType.METADATA, // METADATA is not in ChangeType enum
    // });

    return this.versionRepository.save(version);
  }

  async getVersionHistory(contentId: string): Promise<ContentVersion[]> {
    return this.versionRepository.find({
      where: { contentId },
      order: { majorVersion: "DESC", minorVersion: "DESC", patchVersion: "DESC" }, // Order by version numbers
    });
  }

  async compareVersions(
    versionId1: string,
    versionId2: string
  ): Promise<ContentDiff[]> {
    const [version1, version2] = await Promise.all([
      this.versionRepository.findOne({ where: { id: versionId1 } }),
      this.versionRepository.findOne({ where: { id: versionId2 } }),
    ]);

    if (!version1 || !version2) {
      throw new NotFoundException("Una o ambas versiones no encontradas");
    }

    return this.calculateDiff(version1, version2);
  }

  private calculateDiff(
    oldVersion: ContentVersion,
    newVersion: ContentVersion
  ): ContentDiff[] {
    const changes: ContentDiff[] = [];

    // Comparar contenidoData
    if (oldVersion.contentData && newVersion.contentData) { // Changed 'content' to 'contentData'
      for (const key of Object.keys({
        ...oldVersion.contentData, // Changed 'content' to 'contentData'
        ...newVersion.contentData, // Changed 'content' to 'contentData'
      })) {
        if (
          JSON.stringify(oldVersion.contentData[key]) !== // Changed 'content' to 'contentData'
          JSON.stringify(newVersion.contentData[key]) // Changed 'content' to 'contentData'
        ) {
          changes.push({
            field: `contentData.${key}`, // Changed field name
            previousValue: oldVersion.contentData[key], // Changed 'content' to 'contentData'
            newValue: newVersion.contentData[key], // Changed 'content' to 'contentData'
          });
        }
      }
    }

    // Comparar metadatos
    if (oldVersion.metadata && newVersion.metadata) {
      for (const key of Object.keys({
        ...oldVersion.metadata,
        ...newVersion.metadata,
      })) {
        if (
          JSON.stringify(oldVersion.metadata[key]) !==
          JSON.stringify(newVersion.metadata[key])
        ) {
          changes.push({
            field: `metadata.${key}`,
            previousValue: oldVersion.metadata[key],
            newValue: newVersion.metadata[key],
          });
        }
      }
    }

    // Comparar estado
    if (oldVersion.status !== newVersion.status) {
      changes.push({
        field: "status",
        previousValue: oldVersion.status,
        newValue: newVersion.status,
      });
    }

    // Comparar estado de validación
    if (oldVersion.validationStatus && newVersion.validationStatus) {
      for (const key of Object.keys({
        ...oldVersion.validationStatus,
        ...newVersion.validationStatus,
      })) {
        if (
          oldVersion.validationStatus[key] !== newVersion.validationStatus[key]
        ) {
          changes.push({
            field: `validationStatus.${key}`,
            previousValue: oldVersion.validationStatus[key],
            newValue: newVersion.validationStatus[key],
          });
        }
      }
    }

    return changes;
  }
}
