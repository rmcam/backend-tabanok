import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../../auth/entities/user.entity'; // Ruta corregida
import { CulturalAchievement } from './cultural-achievement.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity('achievement_progress')
export class AchievementProgress {
    @PrimaryColumn('uuid', { default: uuidv4() })
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
