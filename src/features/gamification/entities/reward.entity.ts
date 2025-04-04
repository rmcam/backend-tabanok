import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../../auth/entities/user.entity';
import { RewardType, RewardTrigger } from '../../../common/enums/reward.enum';
import { UserReward } from './user-reward.entity';

@Entity('rewards')
export class Reward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column('jsonb', { nullable: true })
  criteria?: any;

  @Column({
    type: 'enum',
    enum: RewardType,
    default: RewardType.POINTS,
  })
  type: RewardType;

  @Column({
    type: 'enum',
    enum: RewardTrigger,
    default: RewardTrigger.LEVEL_UP,
  })
  trigger: RewardTrigger;

  @Column('jsonb', { nullable: true })
  conditions?: Array<{
    type: string;
    value: number;
    description: string;
  }>;

  @Column('jsonb', { nullable: true })
  rewardValue?: {
    type: string;
    value: number;
  };

  @Column({ default: false })
  isActive: boolean;

  @Column({ default: false })
  isLimited: boolean;

  @Column({ default: false })
  isSecret: boolean;

  @Column({ default: 0 })
  timesAwarded: number;

  @Column({ default: 0 })
  pointsCost: number;

  @Column({ default: 0 })
  points: number;

  @ManyToOne(() => User, { nullable: true })
  user?: User;

  @OneToMany(() => UserReward, (userReward) => userReward.reward)
  userRewards: UserReward[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

export { RewardType, RewardTrigger } from '../../../common/enums/reward.enum';
