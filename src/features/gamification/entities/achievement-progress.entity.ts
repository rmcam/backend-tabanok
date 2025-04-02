import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../../auth/entities/user.entity'; // Ruta corregida
import { CulturalAchievement } from './cultural-achievement.entity';

@Entity('achievement_progress')
export class AchievementProgress {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User)
    user: User;

    @ManyToOne(() => CulturalAchievement)
    achievement: CulturalAchievement;

    @Column('json')
    progress: {
        requirementType: string;
        currentValue: number;
        targetValue: number;
        lastUpdated: Date;
    }[];

    @Column('float')
    percentageCompleted: number;

    @Column({ default: false })
    isCompleted: boolean;

    @Column({ type: 'timestamp', nullable: true })
    completedAt?: Date;

    @Column('json', { nullable: true })
    milestones: {
        description: string;
        value: number;
        isAchieved: boolean;
        achievedAt?: Date;
    }[];

    @Column('json', { nullable: true })
    rewardsCollected?: {
        type: string;
        value: any;
        collectedAt: Date;
    }[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
