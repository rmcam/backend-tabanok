import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class Reward {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'enum', enum: ['POINTS', 'BADGE', 'VIRTUAL_ITEM'] })
  type: RewardType;

  @Column({ type: 'int', nullable: true })
  pointsCost?: number;

  @Column({ type: 'text', nullable: true })
  imageUrl?: string;
}

export enum RewardType {
  POINTS = 'POINTS',
  BADGE = 'BADGE',
  VIRTUAL_ITEM = 'VIRTUAL_ITEM',
}
