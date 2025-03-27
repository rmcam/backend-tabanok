import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Lesson } from '../../lesson/entities/lesson.entity';

export enum ExerciseType {
    MULTIPLE_CHOICE = 'multiple_choice',
    FILL_BLANK = 'fill_blank',
    MATCHING = 'matching',
    ORDERING = 'ordering',
    TRUE_FALSE = 'true_false',
    WRITING = 'writing',
    SPEAKING = 'speaking',
    LISTENING = 'listening'
}

@Entity()
export class Exercise {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column({
        type: 'enum',
        enum: ExerciseType,
    })
    type: ExerciseType;

    @Column({ type: 'jsonb' })
    content: Record<string, any>;

    @Column({ type: 'jsonb', nullable: true })
    solution: Record<string, any>;

    @Column({ type: 'int', default: 0 })
    points: number;

    @Column({ type: 'int' })
    order: number;

    @Column({ default: true })
    isActive: boolean;

    @ManyToOne(() => Lesson, lesson => lesson.exercises, { onDelete: 'CASCADE' })
    lesson: Lesson;

    @Column()
    lessonId: string;

    @Column({ type: 'int', default: 0 })
    attempts: number;

    @Column({ type: 'float', default: 0 })
    successRate: number;

    @Column({ type: 'int', default: 0 })
    averageCompletionTime: number;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
} 