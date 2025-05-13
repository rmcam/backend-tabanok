import {
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryColumn,
    UpdateDateColumn
} from 'typeorm';
import { UserReward } from '../../gamification/entities/user-reward.entity';
import { RewardType, RewardTrigger } from '../../../common/enums/reward.enum';
import { v4 as uuidv4 } from 'uuid';

export { RewardType, RewardTrigger };

@Entity('rewards')
export class Reward {
    @PrimaryColumn('uuid', { default: uuidv4() })
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
        default: RewardType.BADGE, // Corregido: ACHIEVEMENT no es un RewardType válido
    })
    type: RewardType;

    @Column({
        type: 'enum',
        enum: RewardTrigger,
        default: RewardTrigger.LEVEL_UP
    })
    trigger: RewardTrigger;

    @Column('int', { default: 0 })
    pointsCost: number;

    @Column({ type: 'json', nullable: true })
    criteria?: Record<string, any>;

    @Column('json', { nullable: true })
    conditions?: {
        type: string;
        value: any;
        description: string;
    }[];

    @Column('json', { nullable: true })
    rewardValue?: {
        type: string;
        value: any;
        metadata?: Record<string, any>;
    };

    @Column({ nullable: true })
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
