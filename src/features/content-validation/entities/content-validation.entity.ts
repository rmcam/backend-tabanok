import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { ContentType, ValidationCriteria, ValidationFeedback, ValidationStatus } from '../interfaces/content-validation.interface';

@Entity('content_validation')
export class ContentValidation {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    contentId: string;

    @Column({
        type: 'enum',
        enum: ContentType
    })
    contentType: ContentType;

    @Column('text')
    originalContent: string;

    @Column('text', { nullable: true })
    translatedContent: string;

    @Column({
        type: 'enum',
        enum: ValidationStatus,
        default: ValidationStatus.PENDING
    })
    status: ValidationStatus;

    @Column('jsonb')
    criteria: ValidationCriteria;

    @Column('jsonb', { default: [] })
    feedback: ValidationFeedback[];

    @Column('text', { array: true, default: [] })
    validatedBy: string[];

    @Column()
    submittedBy: string;

    @CreateDateColumn()
    submissionDate: Date;

    @UpdateDateColumn()
    lastModifiedDate: Date;

    @Column('float', { default: 0 })
    validationScore: number;

    @Column('jsonb')
    communityVotes: {
        upvotes: number;
        downvotes: number;
        userVotes: Record<string, boolean>;
    };

    @Column('text', { nullable: true })
    dialectVariation: string;

    @Column('text', { nullable: true })
    culturalContext: string;

    @Column('text', { array: true, nullable: true })
    usageExamples: string[];

    @Column('text', { nullable: true })
    audioReference: string;

    @Column('text', { array: true, nullable: true })
    relatedContent: string[];

    @Column('jsonb', { default: {} })
    metadata: {
        reviewCount: number;
        lastReviewDate: Date;
        averageReviewTime: number;
        validationHistory: {
            status: ValidationStatus;
            timestamp: Date;
            validatorId: string;
        }[];
    };

    @Column('boolean', { default: false })
    isUrgent: boolean;

    @Column('text', { array: true, default: [] })
    tags: string[];
} 