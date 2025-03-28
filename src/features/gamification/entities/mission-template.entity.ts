import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { MissionFrequency, MissionType } from './mission.entity';

@Entity('mission_templates')
export class MissionTemplate {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column({
        type: 'enum',
        enum: MissionType
    })
    type: MissionType;

    @Column({
        type: 'enum',
        enum: MissionFrequency
    })
    frequency: MissionFrequency;

    @Column('int')
    baseTargetValue: number;

    @Column('int')
    baseRewardPoints: number;

    @Column('jsonb', { nullable: true })
    rewardBadge?: {
        id: string;
        name: string;
        icon: string;
    };

    @Column('int')
    minLevel: number;

    @Column('int')
    maxLevel: number;

    @Column('jsonb')
    difficultyScaling: {
        targetMultiplier: number;
        rewardMultiplier: number;
    }[];

    @Column('jsonb', { nullable: true })
    requirements?: {
        previousMissions?: string[];
        minimumStreak?: number;
        specificAchievements?: string[];
    };

    @Column('jsonb', { nullable: true })
    bonusConditions?: {
        condition: string;
        multiplier: number;
        description: string;
    }[];
} 