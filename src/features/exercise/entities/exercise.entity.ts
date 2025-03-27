import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Lesson } from '../../lesson/entities/lesson.entity';

export enum ExerciseType {
    MULTIPLE_CHOICE = 'multiple_choice',
    FILL_IN_BLANK = 'fill_in_blank',
    MATCHING = 'matching',
    ORDERING = 'ordering',
    TRUE_FALSE = 'true_false',
    WRITING = 'writing',
    SPEAKING = 'speaking',
    LISTENING = 'listening',
}

@Entity()
export class Exercise {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({
        type: 'enum',
        enum: ExerciseType,
        default: ExerciseType.MULTIPLE_CHOICE,
    })
    type: ExerciseType;

    @Column({ type: 'jsonb' })
    content: Record<string, any>;

    @Column({ type: 'jsonb' })
    solution: Record<string, any>;

    @Column({ type: 'int', default: 10 })
    points: number;

    @Column({ type: 'int' })
    order: number;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'int', default: 0 })
    attempts: number;

    @Column({ type: 'float', default: 0 })
    successRate: number;

    @Column({ type: 'int', default: 0 })
    averageCompletionTime: number; // en segundos

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @ManyToOne(() => Lesson, lesson => lesson.exercises, { onDelete: 'CASCADE' })
    lesson: Lesson;

    @Column({ type: 'uuid' })
    lessonId: string;

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
} 