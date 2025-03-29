import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';

export enum ActivityType {
    READING = 'reading',
    WRITING = 'writing',
    LISTENING = 'listening',
    SPEAKING = 'speaking',
    CULTURAL = 'cultural',
    INTERACTIVE = 'interactive'
}

export enum DifficultyLevel {
    BEGINNER = 'beginner',
    INTERMEDIATE = 'intermediate',
    ADVANCED = 'advanced',
    EXPERT = 'expert'
}

@Entity()
export class Activity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column({ nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: ActivityType,
        default: ActivityType.INTERACTIVE
    })
    type: ActivityType;

    @Column({
        type: 'enum',
        enum: DifficultyLevel,
        default: DifficultyLevel.BEGINNER
    })
    difficulty: DifficultyLevel;

    @Column({ type: 'json' })
    content: Record<string, any>;

    @Column({ default: 0 })
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