import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { RewardType, RewardTrigger } from '../../../common/enums/reward.enum';
// import { UserReward } from './user-reward.entity'; // Remove direct import
import { RewardConditionDto, RewardValueDto } from '../dto/reward.dto'; // Importar DTOs necesarios

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

  @Column({ type: 'enum', enum: RewardTrigger })
  trigger: RewardTrigger; // Añadido trigger

  @Column({ type: 'jsonb', nullable: true }) // Usar jsonb para almacenar array de condiciones
  conditions: RewardConditionDto[]; // Añadido conditions

  @Column({ type: 'jsonb', nullable: true }) // Usar jsonb para almacenar objeto de valor
  rewardValue: RewardValueDto; // Añadido rewardValue

  @Column({ type: 'boolean', default: false })
  isLimited: boolean; // Añadido isLimited

  @Column({ type: 'int', nullable: true })
  limitedQuantity?: number; // Añadido limitedQuantity

  @Column({ type: 'timestamp with time zone', nullable: true })
  startDate?: Date; // Añadido startDate

  @Column({ type: 'timestamp with time zone', nullable: true })
  endDate?: Date; // Añadido endDate

  @Column({ type: 'boolean', default: true }) // Añadido isActive
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  timesAwarded: number; // Añadido timesAwarded

  @Column({ type: 'int', nullable: true })
  pointsCost?: number;

  @Column({ type: 'text', nullable: true })
  imageUrl?: string;

  @CreateDateColumn()
  createdAt: Date; // Añadido createdAt

  @UpdateDateColumn()
  updatedAt: Date; // Añadido updatedAt

  @OneToMany('UserReward', (userReward: any) => userReward.reward) // Use string reference and type 'any'
  userRewards: any[]; // Type can be 'any[]' or a specific interface array
}
