import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { ContentVersion } from '../../content-versioning/entities/content-version.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity('comments')
export class Comment {
    @PrimaryColumn('uuid', { default: uuidv4() })
    id: string;

    @Column()
    content: string;

    @Column()
    author: string;

    @Column({ nullable: true })
    parentId: string;

    @Column()
    versionId: string;

    @ManyToOne(() => ContentVersion)
    version: ContentVersion;

    @ManyToOne(() => Comment, comment => comment.replies)
    parent: Comment;

    @OneToMany(() => Comment, comment => comment.parent)
    replies: Comment[];

    @Column('simple-array', { nullable: true })
    mentions: string[];

    @Column('simple-array', { nullable: true })
    attachments: string[];

    @Column('jsonb', { nullable: true })
    metadata: {
        type?: 'general' | 'review' | 'cultural' | 'technical';
        context?: {
            lineNumber?: number;
            selection?: string;
            [key: string]: any;
        };
        authorRole?: string;
        sentiment?: 'positive' | 'negative' | 'neutral';
        [key: string]: any;
    };

    @Column('boolean', { default: false })
    isResolved: boolean;

    @Column('uuid', { nullable: true })
    resolvedBy: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @Column('timestamp', { nullable: true })
    resolvedAt: Date;

    @Column('simple-array', { nullable: true })
    tags: string[];
} 