import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Content } from '../../content/entities/content.entity';
import { Exercise } from '../../exercise/entities/exercise.entity';
import { Level } from '../../level/entities/level.entity';

@Entity()
export class Lesson {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ type: 'int' })
  order: number;

  @Column({ default: false })
  isUnlocked: boolean;

  @Column({ default: 0 })
  requiredPoints: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isLocked: boolean;

  @Column({ type: 'int', default: 0 })
  experiencePoints: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => Level, level => level.lessons, { onDelete: 'CASCADE' })
  level: Level;

  @Column({ type: 'uuid' })
  levelId: string;

  @OneToMany(() => Content, content => content.lesson)
  contents: Content[];

  @OneToMany(() => Exercise, exercise => exercise.lesson)
  exercises: Exercise[];

  @Column({ type: 'int', default: 0 })
  estimatedDuration: number; // en minutos

  @Column({ type: 'float', default: 0 })
  averageRating: number;

  @Column({ type: 'int', default: 0 })
  totalCompletions: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}