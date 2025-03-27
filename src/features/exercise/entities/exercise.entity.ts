import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Lesson } from '../../lesson/entities/lesson.entity';

export enum ExerciseType {
    MULTIPLE_CHOICE = 'multiple_choice',
    FILL_IN_BLANK = 'fill_in_blank',
    MATCHING = 'matching',
    ORDERING = 'ordering',
    TRUE_FALSE = 'true_false',
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
        default: ExerciseType.MULTIPLE_CHOICE,
    })
    type: ExerciseType;

    @Column()
    order: number;

    @Column({ type: 'json' })
    content: Record<string, any>;

    @Column({ type: 'json', nullable: true })
    solution: Record<string, any>;

    @Column({ default: 10 })
    points: number;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Lesson, (lesson) => lesson.exercises)
    lesson: Lesson;
} 