import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { RewardType } from '../../../common/enums/reward.enum';

@Entity()
export class Reward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: RewardType })
  type: RewardType;

  @Column({ type: 'int', nullable: true })
  pointsCost?: number;

  @Column({ type: 'text', nullable: true })
  imageUrl?: string;
}
