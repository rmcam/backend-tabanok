import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

export enum RewardType {
    ACHIEVEMENT = 'achievement',
    BADGE = 'badge',
    LEVEL_UP = 'level_up',
    STREAK = 'streak',
    POINTS = 'points',
}

@Entity()
export class Reward {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    title: string;

    @Column()
    description: string;

    @Column({
        type: 'enum',
        enum: RewardType,
        default: RewardType.ACHIEVEMENT,
    })
    type: RewardType;

    @Column({ type: 'json', nullable: true })
    criteria: Record<string, any>;

    @Column({ default: 0 })
    points: number;

    @Column({ default: false })
    isSecret: boolean;

    @Column({ default: true })
    isActive: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.rewards)
    user: User;
} 