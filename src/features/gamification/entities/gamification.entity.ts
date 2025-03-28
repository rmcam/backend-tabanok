import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Achievement } from './achievement.entity';
import { Badge } from './badge.entity';
import { Mission } from './mission.entity';

@Entity('gamification')
export class Gamification {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    userId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    user: User;

    @Column({ type: 'integer', default: 0 })
    points: number;

    @Column({ type: 'integer', default: 1 })
    level: number;

    @Column({ type: 'integer', default: 0 })
    experience: number;

    @Column({ type: 'integer', default: 100 })
    nextLevelExperience: number;

    @ManyToMany(() => Achievement)
    @JoinTable()
    achievements: Achievement[];

    @ManyToMany(() => Badge)
    @JoinTable()
    badges: Badge[];

    @ManyToMany(() => Mission)
    @JoinTable()
    activeMissions: Mission[];

    @Column({ type: 'jsonb', default: [] })
    stats: {
        lessonsCompleted: number;
        exercisesCompleted: number;
        perfectScores: number;
        learningStreak: number;
        lastActivityDate: Date;
        culturalContributions: number;
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