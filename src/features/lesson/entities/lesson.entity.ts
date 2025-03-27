import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Content } from '../../content/entities/content.entity';
import { Exercise } from '../../exercise/entities/exercise.entity';
import { Level } from '../../level/entities/level.entity';

@Entity()
export class Lesson {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'int', default: 0 })
  order: number;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isLocked: boolean;

  @Column({ type: 'int', default: 0 })
  requiredPoints: number;

  @Column({ type: 'int', default: 0 })
  experiencePoints: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @ManyToOne(() => Level, level => level.lessons)
  level: Level;

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}