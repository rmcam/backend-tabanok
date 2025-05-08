import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { MissionType } from './mission.entity'; // Import MissionType normally

export enum MissionFrequency { // Export added here
  DIARIA = 'diaria',
  SEMANAL = 'semanal',
  MENSUAL = 'mensual',
  TEMPORADA = 'temporada',
  CONTRIBUCION = 'contribucion',
  UNICA = 'unica',
}

// Interfaz para el campo conditions
export interface MissionConditions {
  lessons?: number;
  exercises?: number;
  pointsSource?: string;
  streakDays?: number;
  achievementType?: string;
  topic?: string; // Agregar la propiedad topic
  // Agregar otros tipos de condiciones si es necesario
}

export interface MissionRewards {
  points: number;
  badge?: {
    name: string;
    icon: string;
  };
}

@Entity('mission_templates')
export class MissionTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({ type: 'enum', enum: MissionType })
  type: MissionType;

  @Column({ type: 'enum', enum: MissionFrequency })
  frequency: MissionFrequency;

  @Column({ nullable: true })
  category?: string;

  @Column({ nullable: true })
  tags?: string;

  @Column('json', { nullable: true })
  conditions?: MissionConditions;

  @Column('json', { nullable: true })
  rewards?: MissionRewards;

  @Column({ type: 'date', nullable: true })
  startDate?: string;

  @Column({ type: 'date', nullable: true })
  endDate?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column('int', { default: 1 })
  minLevel: number;

  @Column('int', { default: 0 })
  maxLevel: number;

  @Column('float', { default: 1 })
  baseTargetValue: number;

  @Column('float', { default: 1 })
  baseRewardPoints: number;

  @Column('jsonb', { nullable: true })
  bonusConditions?: {
    condition: string;
    multiplier: number;
    description?: string;
  }[];

  @Column('jsonb', { nullable: true })
  requirements?: {
    minimumStreak?: number;
    specificAchievements?: string[];
    previousMissions?: string[];
  };

  @Column('jsonb', { nullable: true })
  difficultyScaling?: {
    level: number;
    targetMultiplier: number;
    rewardMultiplier: number;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
