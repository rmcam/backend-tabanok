import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ChangelogEntry, ChangeType, ContentData, ContentDiff, ContentStatus, ValidationStatus, VersionMetadata } from '../interfaces/content-version.interface';

@Entity('content_versions')
export class ContentVersion {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    contentId: string;

    @Column()
    versionNumber: number;

    @Column()
    majorVersion: number;

    @Column()
    minorVersion: number;

    @Column()
    patchVersion: number;

    @Column({ type: 'jsonb' })
    content: ContentData;

    @Column({ type: 'jsonb' })
    metadata: VersionMetadata;

    @Column({
        type: 'enum',
        enum: ContentStatus,
        default: ContentStatus.DRAFT
    })
    status: ContentStatus;

    @Column({
        type: 'enum',
        enum: ChangeType,
        default: ChangeType.CREATION
    })
    changeType: ChangeType;

    @Column({ type: 'jsonb', default: [] })
    changes: ContentDiff[];

    @Column({ type: 'jsonb' })
    validationStatus: ValidationStatus;

    @Column({ nullable: true })
    previousVersion?: string;

    @Column({ nullable: true })
    nextVersion?: string;

    @Column({ nullable: true })
    branchName?: string;

    @Column({ default: true })
    isLatest: boolean;

    @Column({ default: false })
    hasConflicts: boolean;

    @Column({ type: 'jsonb', default: [] })
    relatedVersions: string[];

    @Column({ type: 'jsonb', default: [] })
    changelog: ChangelogEntry[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
} 