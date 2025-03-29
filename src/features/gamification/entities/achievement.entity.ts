import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { UserAchievement } from './user-achievement.entity';

export enum AchievementType {
    LEVEL_REACHED = 'LEVEL_REACHED',
    LESSONS_COMPLETED = 'LESSONS_COMPLETED',
    PERFECT_SCORES = 'PERFECT_SCORES',
    STREAK_MAINTAINED = 'STREAK_MAINTAINED',
    CULTURAL_CONTRIBUTIONS = 'CULTURAL_CONTRIBUTIONS',
    POINTS_EARNED = 'POINTS_EARNED'
}

@Entity('achievements')
export class Achievement {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    description: string;

    @Column({
        type: 'enum',
        enum: AchievementType
    })
    type: AchievementType;

    @Column('int')
    requirement: number;

    @Column('int')
    bonusPoints: number;

    @Column('jsonb', { nullable: true })
    badge?: {
        id: string;
        name: string;
        icon: string;
        description?: string;
    };

    @Column({ default: false })
    isSecret: boolean;

    @Column('jsonb', { nullable: true })
    tiers?: {
        bronze: number;
        silver: number;
        gold: number;
        platinum: number;
        diamond: number;
    };

    @OneToMany(() => UserAchievement, userAchievement => userAchievement.achievement)
    userAchievements: UserAchievement[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}