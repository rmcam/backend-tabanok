import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Exercise } from '../../exercise/entities/exercise.entity';
import { Topic } from '../../topic/entities/topic.entity';

@Entity()
export class Lesson {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column()
    order: number;

    @Column({ default: 0 })
    requiredPoints: number;

    @Column({ type: 'json', nullable: true })
    metadata: Record<string, any>;

    @Column({ default: false })
    isUnlocked: boolean;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Topic, (topic) => topic.lessons)
    topic: Topic;

    @OneToMany(() => Exercise, (exercise) => exercise.lesson)
    exercises: Exercise[];
} 