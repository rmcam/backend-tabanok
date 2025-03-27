import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Lesson } from '../../lesson/entities/lesson.entity';
import { ContentType } from '../enums/content-type.enum';

@Entity()
export class Content {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column({
        type: 'enum',
        enum: ContentType,
    })
    type: ContentType;

    @Column({ nullable: true })
    fileUrl?: string;

    @Column({ type: 'text', nullable: true })
    textContent?: string;

    @Column({ type: 'int', nullable: true })
    duration?: number;

    @Column({ type: 'int' })
    order: number;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => Lesson, lesson => lesson.contents, { onDelete: 'CASCADE' })
    lesson: Lesson;

    @Column()
    lessonId: string;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
} 