import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Lesson } from '../../lesson/entities/lesson.entity';

export enum ExerciseType {
    MULTIPLE_CHOICE = 'multiple_choice',
    FILL_IN_BLANK = 'fill_in_blank',
    MATCHING = 'matching',
    ORDERING = 'ordering',
    PRONUNCIATION = 'pronunciation',
    WRITING = 'writing',
    LISTENING = 'listening'
}

@Entity()
export class Exercise {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 100 })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({
        type: 'enum',
        enum: ExerciseType,
        default: ExerciseType.MULTIPLE_CHOICE
    })
    type: ExerciseType;

    @Column({ type: 'jsonb' })
    content: Record<string, any>;

    @Column({ type: 'jsonb' })
    correctAnswer: Record<string, any>;

    @Column({ type: 'int', default: 0 })
    points: number;

    @Column({ type: 'int', default: 0 })
    order: number;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'int', default: 0 })
    timeLimit: number; // en segundos

    @Column({ type: 'int', default: 0 })
    attempts: number;

    @Column({ type: 'jsonb', nullable: true })
    hints: string[];

    @Column({ type: 'text', nullable: true })
    feedback: string;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @ManyToOne(() => Lesson, lesson => lesson.exercises)
    lesson: Lesson;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 