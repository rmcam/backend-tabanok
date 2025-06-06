import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm'; // Cambiar PrimaryColumn a PrimaryGeneratedColumn
import { User } from '../../../auth/entities/user.entity';
// import { v4 as uuidv4 } from 'uuid'; // Eliminar importación de uuidv4

@Entity()
export class UserLevel {
  @PrimaryGeneratedColumn('uuid') // Usar PrimaryGeneratedColumn
  id: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column({ default: 1 })
  level: number;

  @Column({ default: 0 })
  experience: number;

  @Column({ default: 0 })
  points: number;

  @Column({ default: 0 })
  experienceToNextLevel: number; // Añadir propiedad faltante

  @Column({ type: 'jsonb', default: { current: 0, longest: 0, lastActivityDate: null } })
  consistencyStreak: { current: number; longest: number; lastActivityDate: Date | null }; // Añadir propiedad faltante

  @Column({ type: 'jsonb', default: [] })
  streakHistory: { date: Date; length: number }[]; // Añadir propiedad faltante

  @Column({ type: 'jsonb', default: [] })
  levelHistory: { level: number; date: Date }[]; // Añadir propiedad faltante

  @Column({ type: 'jsonb', default: [] })
  activityLog: { type: string; timestamp: Date; details?: any }[]; // Añadir propiedad faltante


  @Column({ type: 'jsonb', default: [] })
  bonuses: { type: string; amount: number; timestamp: Date }[]; // Añadir propiedad faltante

  @Column({ default: 0 })
  lessonsCompleted: number; // Añadir propiedad faltante

  @Column({ default: 0 })
  exercisesCompleted: number; // Añadir propiedad faltante

  @Column({ default: 0 })
  perfectScores: number; // Añadir propiedad faltante

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
