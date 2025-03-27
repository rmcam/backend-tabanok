import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum ActivityType {
    QUIZ = 'quiz',
    READING = 'reading',
    LISTENING = 'listening',
    WRITING = 'writing',
    SPEAKING = 'speaking',
    VOCABULARY = 'vocabulary',
    GRAMMAR = 'grammar',
    PRONUNCIATION = 'pronunciation',
    VOCABULARY_QUIZ = 'vocabulary_quiz',
}

export enum DifficultyLevel {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced',
}

@Entity()
export class Activity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column({
        type: 'enum',
        enum: ActivityType,
        default: ActivityType.QUIZ,
    })
    type: ActivityType;

    @Column({
        type: 'enum',
        enum: DifficultyLevel,
        default: DifficultyLevel.BEGINNER,
    })
    difficulty: DifficultyLevel;

    @Column({ type: 'json' })
    content: Record<string, any>;

    @Column({ default: 10 })
    points: number;

    @Column({ default: true })
    isActive: boolean;

    @Column({ type: 'jsonb', nullable: true })
    metadata: Record<string, any>;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 