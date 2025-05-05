import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { User } from '../../../auth/entities/user.entity';
import { Reward } from './reward.entity';

export enum RewardStatus {
    ACTIVE = 'ACTIVE',
    EXPIRED = 'EXPIRED',
    CONSUMED = 'CONSUMED'
}

@Entity('user_rewards')
export class UserReward {
    @PrimaryColumn('uuid')
    userId: string;

    @PrimaryColumn('uuid')
    rewardId: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user: User;

    @ManyToOne('Reward', { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'rewardId' })
    reward: Reward;

    @Column({
        type: 'varchar',
        enum: RewardStatus,
        default: RewardStatus.ACTIVE
    })
    status: RewardStatus;

    @Column('json', { nullable: true })
    metadata?: {
        usageCount?: number;
        lastUsed?: Date;
        expirationDate?: Date;
        additionalData?: Record<string, any>;
    };

    @Column({ nullable: true })
    consumedAt?: Date;

    @Column({ nullable: true })
    expiresAt?: Date;

    @Column({ type: 'timestamp' })
    dateAwarded: Date;

    @CreateDateColumn()
    createdAt: Date;
}
