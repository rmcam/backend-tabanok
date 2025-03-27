import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Lesson } from '../../lesson/entities/lesson.entity';

export enum ContentType {
    TEXT = 'text',
    IMAGE = 'image',
    AUDIO = 'audio',
    VIDEO = 'video',
    DOCUMENT = 'document'
}

@Entity()
export class Content {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({
        type: 'enum',
        enum: ContentType,
        default: ContentType.TEXT
    })
    type: ContentType;

    @Column({ type: 'text', nullable: true })
    content: string;

    @Column({ type: 'varchar', nullable: true })
    fileUrl: string;

    @Column({ type: 'varchar', nullable: true })
    thumbnailUrl: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @Column({ type: 'int', default: 0 })
    order: number;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'int', default: 0 })
    duration: number; // en segundos, para audio/video

    @ManyToOne(() => Lesson, lesson => lesson.contents)
    lesson: Lesson;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 