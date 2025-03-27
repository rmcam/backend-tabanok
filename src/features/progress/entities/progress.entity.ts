import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Exercise } from '../../exercise/entities/exercise.entity';
import { User } from '../../user/entities/user.entity';

@Entity()
export class Progress {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ default: 0 })
    score: number;

    @Column({ default: false })
    isCompleted: boolean;

    @Column({ type: 'json', nullable: true })
    answers: Record<string, any>;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.progress)
    user: User;

    @ManyToOne(() => Exercise)
    exercise: Exercise;
} 