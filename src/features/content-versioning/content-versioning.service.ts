import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateVersionDto } from './dto/create-version.dto';
import { UpdateVersionDto } from './dto/update-version.dto';
import { ContentVersion } from './entities/content-version.entity';
import { ChangeType, ContentDiff, ContentStatus } from './interfaces/content-version.interface';

@Injectable()
export class ContentVersioningService {
    constructor(
        @InjectRepository(ContentVersion)
        private readonly versionRepository: Repository<ContentVersion>
    ) { }

    async create(createVersionDto: CreateVersionDto): Promise<ContentVersion> {
        const version = new ContentVersion();
        Object.assign(version, {
            ...createVersionDto,
            status: ContentStatus.DRAFT,
            changeType: ChangeType.CREATION,
            changes: [],
            metadata: {
                tags: [],
                author: createVersionDto.metadata.author,
                reviewers: [],
                validatedBy: '',
                createdAt: new Date()
            },
            validationStatus: {
                culturalAccuracy: 0,
                linguisticQuality: 0,
                communityApproval: false,
                isValidated: false,
                score: 0,
                dialectConsistency: 0,
                feedback: []
            },
            relatedVersions: [],
            changelog: [],
            isLatest: true,
            hasConflicts: false
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

    async update(id: string, updateVersionDto: UpdateVersionDto): Promise<ContentVersion> {
        const version = await this.findOne(id);
        Object.assign(version, {
            ...updateVersionDto,
            metadata: {
                ...version.metadata,
                ...updateVersionDto.metadata,
                modifiedAt: new Date()
            }
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
            order: { versionNumber: 'DESC' }
        });
    }

    async findLatestVersion(contentId: string): Promise<ContentVersion> {
        const version = await this.versionRepository.findOne({
            where: { contentId, isLatest: true }
        });
        if (!version) {
            throw new NotFoundException(`No se encontró una versión activa para el contenido ${contentId}`);
        }
        return version;
    }

    async mergeVersions(sourceId: string, targetId: string): Promise<ContentVersion> {
        const source = await this.findOne(sourceId);
        const target = await this.findOne(targetId);

        const mergedVersion = new ContentVersion();
        Object.assign(mergedVersion, {
            contentId: target.contentId,
            versionNumber: target.versionNumber + 1,
            majorVersion: target.majorVersion,
            minorVersion: target.minorVersion + 1,
            patchVersion: 0,
            status: ContentStatus.DRAFT,
            changeType: ChangeType.MODIFICATION,
            content: {
                ...target.content,
                ...source.content
            },
            metadata: {
                ...target.metadata,
                modifiedAt: new Date()
            },
            validationStatus: {
                culturalAccuracy: 0,
                linguisticQuality: 0,
                communityApproval: false,
                isValidated: false,
                score: 0,
                dialectConsistency: 0,
                feedback: []
            },
            previousVersion: targetId,
            isLatest: true,
            hasConflicts: false,
            relatedVersions: [...target.relatedVersions, sourceId],
            changelog: [
                ...target.changelog,
                {
                    date: new Date(),
                    author: source.metadata.author,
                    description: `Merged version ${source.versionNumber} into version ${target.versionNumber}`,
                    type: ChangeType.MODIFICATION
                }
            ]
        });

        // Actualizar las versiones anteriores
        await this.versionRepository.update(targetId, { isLatest: false });
        await this.versionRepository.update(sourceId, { isLatest: false });

        return this.versionRepository.save(mergedVersion);
    }

    async createVersion(
        contentId: string,
        content: {
            original: string;
            translated?: string;
            culturalContext?: string;
            pronunciation?: string;
            audioReference?: string;
            dialectVariation?: string;
        },
        author: string,
        changeType: ChangeType = ChangeType.CREATION
    ): Promise<ContentVersion> {
        const existingVersions = await this.versionRepository.find({
            where: { contentId },
            order: { versionNumber: 'DESC' }
        });

        const versionNumber = existingVersions.length + 1;
        const [major, minor, patch] = this.calculateVersionNumbers(changeType, existingVersions[0]);

        const version = new ContentVersion();
        Object.assign(version, {
            contentId,
            versionNumber,
            majorVersion: major,
            minorVersion: minor,
            patchVersion: patch,
            status: ContentStatus.DRAFT,
            changeType,
            content,
            metadata: {
                author,
                reviewers: [],
                validatedBy: '',
                createdAt: new Date(),
                modifiedAt: new Date(),
                comments: [],
                tags: []
            },
            validationStatus: {
                culturalAccuracy: 0,
                linguisticQuality: 0,
                communityApproval: false,
                isValidated: false,
                score: 0,
                dialectConsistency: 0,
                feedback: []
            },
            changes: [],
            isLatest: true,
            hasConflicts: false,
            relatedVersions: []
        });

        if (existingVersions.length > 0) {
            const latestVersion = existingVersions[0];
            version.previousVersion = latestVersion.id;
            await this.versionRepository.update(latestVersion.id, {
                nextVersion: version.id,
                isLatest: false
            });
        }

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
                return [majorVersion + 1, 0, 0];
            case ChangeType.MODIFICATION:
                return [majorVersion, minorVersion + 1, 0];
            case ChangeType.TRANSLATION:
            case ChangeType.CULTURAL_CONTEXT:
            case ChangeType.PRONUNCIATION:
            case ChangeType.METADATA:
                return [majorVersion, minorVersion, patchVersion + 1];
            default:
                return [majorVersion, minorVersion, patchVersion + 1];
        }
    }

    async updateVersion(id: string, updateVersionDto: UpdateVersionDto): Promise<ContentVersion> {
        const version = await this.findOne(id);
        if (!version) {
            throw new NotFoundException(`Version with ID ${id} not found`);
        }

        // Actualizar los campos básicos
        Object.assign(version, {
            ...updateVersionDto,
            metadata: updateVersionDto.metadata || version.metadata,
            updatedAt: new Date()
        });

        return this.versionRepository.save(version);
    }

    async createBranch(
        versionId: string,
        branchName: string,
        author: string
    ): Promise<ContentVersion> {
        const baseVersion = await this.versionRepository.findOne({ where: { id: versionId } });
        if (!baseVersion) {
            throw new NotFoundException(`Versión base ${versionId} no encontrada`);
        }

        const branchVersion = this.versionRepository.create({
            ...baseVersion,
            id: undefined,
            branchName,
            previousVersion: baseVersion.id,
            nextVersion: null,
            isLatest: false,
            metadata: {
                ...baseVersion.metadata,
                author,
                createdAt: new Date(),
                modifiedAt: new Date(),
                comments: [`Rama creada desde versión ${baseVersion.versionNumber}`]
            }
        });

        return this.versionRepository.save(branchVersion);
    }

    async mergeBranch(
        branchVersionId: string,
        targetVersionId: string,
        author: string
    ): Promise<ContentVersion> {
        const [branchVersion, targetVersion] = await Promise.all([
            this.versionRepository.findOne({ where: { id: branchVersionId } }),
            this.versionRepository.findOne({ where: { id: targetVersionId } })
        ]);

        if (!branchVersion || !targetVersion) {
            throw new NotFoundException('Versión de rama o versión objetivo no encontrada');
        }

        const mergedContent = this.mergeContents(branchVersion.content, targetVersion.content);
        const [major, minor, patch] = this.calculateVersionNumbers(ChangeType.MODIFICATION, targetVersion);

        const mergedVersion = new ContentVersion();
        Object.assign(mergedVersion, {
            contentId: targetVersion.contentId,
            versionNumber: targetVersion.versionNumber + 1,
            majorVersion: major,
            minorVersion: minor,
            patchVersion: patch,
            status: ContentStatus.DRAFT,
            changeType: ChangeType.MODIFICATION,
            content: mergedContent,
            previousVersion: targetVersion.id,
            metadata: {
                author,
                reviewers: [],
                validatedBy: '',
                createdAt: new Date(),
                modifiedAt: new Date(),
                comments: [`Fusión de rama ${branchVersion.branchName}`],
                tags: [...new Set([...targetVersion.metadata.tags, ...branchVersion.metadata.tags])]
            },
            validationStatus: {
                culturalAccuracy: 0,
                linguisticQuality: 0,
                communityApproval: false,
                isValidated: false,
                score: 0,
                dialectConsistency: 0,
                feedback: []
            },
            changes: [],
            isLatest: true,
            hasConflicts: false,
            relatedVersions: [branchVersionId]
        });

        await this.versionRepository.update(targetVersionId, {
            isLatest: false,
            nextVersion: mergedVersion.id
        });

        return this.versionRepository.save(mergedVersion);
    }

    private mergeContents(
        branchContent: ContentVersion['content'],
        targetContent: ContentVersion['content']
    ): ContentVersion['content'] {
        // Implementar lógica de fusión más sofisticada según necesidades
        return {
            ...targetContent,
            ...branchContent,
            culturalContext: [targetContent.culturalContext, branchContent.culturalContext]
                .filter(Boolean)
                .join(' | ')
        };
    }

    async publishVersion(
        versionId: string,
        author: string
    ): Promise<ContentVersion> {
        const version = await this.versionRepository.findOne({ where: { id: versionId } });
        if (!version) {
            throw new NotFoundException(`Versión ${versionId} no encontrada`);
        }

        if (!version.validationStatus.isValidated) {
            throw new BadRequestException('La versión debe ser validada antes de publicar');
        }

        version.status = ContentStatus.PUBLISHED;
        version.metadata.publishedAt = new Date();
        version.changelog.push({
            date: new Date(),
            author,
            description: 'Versión publicada',
            type: ChangeType.METADATA
        });

        return this.versionRepository.save(version);
    }

    async getVersionHistory(contentId: string): Promise<ContentVersion[]> {
        return this.versionRepository.find({
            where: { contentId },
            order: { versionNumber: 'DESC' }
        });
    }

    async compareVersions(
        versionId1: string,
        versionId2: string
    ): Promise<ContentDiff[]> {
        const [version1, version2] = await Promise.all([
            this.versionRepository.findOne({ where: { id: versionId1 } }),
            this.versionRepository.findOne({ where: { id: versionId2 } })
        ]);

        if (!version1 || !version2) {
            throw new NotFoundException('Una o ambas versiones no encontradas');
        }

        return this.calculateDiff(version1, version2);
    }

    private calculateDiff(oldVersion: ContentVersion, newVersion: ContentVersion): ContentDiff[] {
        const changes: ContentDiff[] = [];

        // Comparar contenido
        if (oldVersion.content && newVersion.content) {
            for (const key of Object.keys({ ...oldVersion.content, ...newVersion.content })) {
                if (JSON.stringify(oldVersion.content[key]) !== JSON.stringify(newVersion.content[key])) {
                    changes.push({
                        field: `content.${key}`,
                        previousValue: oldVersion.content[key],
                        newValue: newVersion.content[key]
                    });
                }
            }
        }

        // Comparar metadatos
        if (oldVersion.metadata && newVersion.metadata) {
            for (const key of Object.keys({ ...oldVersion.metadata, ...newVersion.metadata })) {
                if (JSON.stringify(oldVersion.metadata[key]) !== JSON.stringify(newVersion.metadata[key])) {
                    changes.push({
                        field: `metadata.${key}`,
                        previousValue: oldVersion.metadata[key],
                        newValue: newVersion.metadata[key]
                    });
                }
            }
        }

        // Comparar estado
        if (oldVersion.status !== newVersion.status) {
            changes.push({
                field: 'status',
                previousValue: oldVersion.status,
                newValue: newVersion.status
            });
        }

        // Comparar estado de validación
        if (oldVersion.validationStatus && newVersion.validationStatus) {
            for (const key of Object.keys({ ...oldVersion.validationStatus, ...newVersion.validationStatus })) {
                if (oldVersion.validationStatus[key] !== newVersion.validationStatus[key]) {
                    changes.push({
                        field: `validationStatus.${key}`,
                        previousValue: oldVersion.validationStatus[key],
                        newValue: newVersion.validationStatus[key]
                    });
                }
            }
        }

        return changes;
    }
} 