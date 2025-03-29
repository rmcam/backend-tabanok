import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { UserReward } from '../../gamification/entities/user-reward.entity';

export enum RewardType {
    ACHIEVEMENT = 'achievement',
    BADGE = 'badge',
    LEVEL_UP = 'level_up',
    STREAK = 'streak',
    POINTS = 'points',
    CULTURAL_ITEM = 'cultural_item',
    SPECIAL_ACCESS = 'special_access',
    TITLE = 'title'
}

export enum RewardTrigger {
    LEVEL_UP = 'LEVEL_UP',
    ACHIEVEMENT = 'ACHIEVEMENT',
    CONSISTENCY = 'CONSISTENCY',
    SEASONAL = 'SEASONAL',
    COMMUNITY = 'COMMUNITY'
}

@Entity('rewards')
export class Reward {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    name: string;

    @Column()
    title: string;

    @Column('text')
    description: string;

    @Column({
        type: 'enum',
        enum: RewardType,
        default: RewardType.ACHIEVEMENT,
    })
    type: RewardType;

    @Column({
        type: 'enum',
        enum: RewardTrigger,
        default: RewardTrigger.ACHIEVEMENT
    })
    trigger: RewardTrigger;

    @Column('int', { default: 0 })
    pointsCost: number;

    @Column({ type: 'json', nullable: true })
    criteria: Record<string, any>;

    @Column('json', { nullable: true })
    conditions?: {
        type: string;
        value: any;
        description: string;
    }[];

    @Column('json')
    rewardValue: {
        type: string;
        value: any;
        metadata?: Record<string, any>;
    };

    @Column({ default: false })
    isLimited: boolean;

    @Column({ nullable: true })
    limitedQuantity?: number;

    @Column({ nullable: true })
    startDate?: Date;

    @Column({ nullable: true })
    endDate?: Date;

    @Column({ default: 0 })
    timesAwarded: number;

    @Column({ default: 0 })
    points: number;

    @Column({ default: false })
    isSecret: boolean;

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    expirationDays?: number;

    @OneToMany(() => UserReward, userReward => userReward.reward)
    userRewards: UserReward[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 