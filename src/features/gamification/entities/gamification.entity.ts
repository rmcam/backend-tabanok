import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Achievement } from './achievement.entity';
import { Badge } from './badge.entity';

@Entity('gamification')
export class Gamification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;

    @Column()
    userId: string;

    @Column({ type: 'integer', default: 0 })
    points: number;

    @Column({ type: 'integer', default: 1 })
    level: number;

    @Column({ type: 'integer', default: 0 })
    experience: number;

    @Column({ type: 'integer', default: 100 })
    nextLevelExperience: number;

    @Column({ type: 'jsonb', default: [] })
    achievements: Achievement[];

    @Column({ type: 'jsonb', default: [] })
    badges: Badge[];

    @Column({ type: 'jsonb', default: {} })
    stats: {
        lessonsCompleted: number;
        exercisesCompleted: number;
        perfectScores: number;
        learningStreak: number;
        lastActivityDate: Date;
    };

    @Column({ type: 'jsonb', default: [] })
    recentActivities: {
        type: string;
        description: string;
        pointsEarned: number;
        timestamp: Date;
    }[];

    @CreateDateColumn({ type: 'timestamp' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp' })
    updatedAt: Date;
} 