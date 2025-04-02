import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RewardType, RewardTrigger } from '@/common/enums/reward.enum';
export { RewardType, RewardTrigger };

@Entity()
export class Reward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'enum', enum: RewardType })
  type: RewardType;

  @Column({ type: 'enum', enum: RewardTrigger })
  trigger: RewardTrigger;

  @Column({ type: 'jsonb', nullable: true })
  conditions: Array<{
    type: string;
    value: number;
    description: string;
  }>;

  @Column({ type: 'jsonb' })
  rewardValue: {
    type: string;
    value: any;
    metadata?: Record<string, any>;
  };

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isLimited: boolean;

  @Column({ nullable: true })
  limitedQuantity: number;

  @Column({ default: 0 })
  timesAwarded: number;

  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
