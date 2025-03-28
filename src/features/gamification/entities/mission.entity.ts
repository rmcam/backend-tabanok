import { Column, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Gamification } from './gamification.entity';
import { Season } from './season.entity';

export enum MissionFrequency {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
    MONTHLY = 'MONTHLY'
}

export enum MissionType {
    COMPLETE_LESSONS = 'COMPLETE_LESSONS',
    PRACTICE_EXERCISES = 'PRACTICE_EXERCISES',
    EARN_POINTS = 'EARN_POINTS',
    MAINTAIN_STREAK = 'MAINTAIN_STREAK',
    CULTURAL_CONTENT = 'CULTURAL_CONTENT',
    COMMUNITY_INTERACTION = 'COMMUNITY_INTERACTION'
}

@Entity('missions')
export class Mission {
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
    targetValue: number;

    @Column('int')
    rewardPoints: number;

    @Column('jsonb', { nullable: true })
    rewardBadge?: {
        id: string;
        name: string;
        icon: string;
    };

    @Column('timestamp')
    startDate: Date;

    @Column('timestamp')
    endDate: Date;

    @ManyToMany(() => Gamification, gamification => gamification.activeMissions)
    participants: Gamification[];

    @Column('jsonb', { default: [] })
    completedBy: {
        userId: string;
        progress: number;
        completedAt: Date | null;
    }[];

    @Column('jsonb', { nullable: true })
    bonusConditions?: {
        condition: string;
        multiplier: number;
        description: string;
    }[];

    @ManyToOne(() => Season, season => season.missions)
    season: Season;
} 