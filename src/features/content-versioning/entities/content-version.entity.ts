import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ChangeType, ContentDiff, ValidationStatus } from '../interfaces/content-version.interface';

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

    @Column('jsonb', { nullable: true })
    content: Record<string, any>;

    @Column('jsonb', { nullable: true, default: {} })
    metadata: Record<string, any>;

    @Column({ nullable: true })
    status: string;

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

    @Column('jsonb', { nullable: true, default: [] })
    changelog: Array<{
        date: Date;
        author: string;
        description: string;
        type: string;
    }>;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 