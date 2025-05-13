import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryColumn,
    UpdateDateColumn,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { User } from '../../../auth/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

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
    @PrimaryColumn('uuid', { default: uuidv4() })
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

    @ManyToOne(() => User, (user) => user.activities)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column({ nullable: true })
    userId: string;
}
