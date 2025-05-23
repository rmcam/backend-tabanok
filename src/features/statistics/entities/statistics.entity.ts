import { ApiProperty } from '@nestjs/swagger';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { AreaDto } from '../dto/statistics-area.dto';
import { CategoryMetricsDto } from '../dto/category-metrics.dto';
import { LearningMetricsDto } from '../dto/learning-metrics.dto';
import { WeeklyProgressDto } from '../dto/weekly-progress.dto';
import { MonthlyProgressDto } from '../dto/monthly-progress.dto';
import { PeriodicProgressDto } from '../dto/periodic-progress.dto';
import { AchievementStatsDto } from '../dto/achievement-stats.dto';
import { BadgeStatsDto } from '../dto/badge-stats.dto';
import { LearningPathDto } from '../dto/learning-path.dto';
import { CategoryType, FrequencyType, GoalType } from '../types/category.enum';
import { User } from '../../../auth/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';

@Entity('statistics')
export class Statistics {
  @ApiProperty({ description: 'ID único de las estadísticas', example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef' })
  @PrimaryColumn('uuid', { default: uuidv4() })
  id: string;

  @ApiProperty({ description: 'ID del usuario asociado a las estadísticas', example: 'f0e9d8c7-b6a5-4321-fedc-ba9876543210' })
  @Column()
  userId: string;

  @OneToOne(() => User, (user) => user.statistics)
  @JoinColumn({ name: 'userId' })
  user: User;

  @ApiProperty({ type: CategoryMetricsDto, description: 'Métricas por categoría' })
  @Column('jsonb', { default: {} })
  categoryMetrics: Record<CategoryType, CategoryMetricsDto>;

  @ApiProperty({ type: [AreaDto], description: 'Áreas de fortaleza del usuario' })
  @Column('jsonb', { default: '[]' })
  strengthAreas: AreaDto[];

  @ApiProperty({ type: [AreaDto], description: 'Áreas de mejora del usuario' })
  @Column('jsonb', { default: '[]' })
  improvementAreas: AreaDto[];

  @ApiProperty({ type: LearningMetricsDto, description: 'Métricas generales de aprendizaje' })
  @Column('jsonb')
  learningMetrics: LearningMetricsDto;

  @ApiProperty({ type: [WeeklyProgressDto], description: 'Progreso semanal del usuario' })
  @Column({ type: 'jsonb', default: [] })
  weeklyProgress: WeeklyProgressDto[];

  @ApiProperty({ type: [MonthlyProgressDto], description: 'Progreso mensual del usuario' })
  @Column({ type: 'jsonb', default: [] })
  monthlyProgress: MonthlyProgressDto[];

  @ApiProperty({ type: [PeriodicProgressDto], description: 'Progreso periódico del usuario' })
  @Column({ type: 'jsonb', default: [] })
  periodicProgress: PeriodicProgressDto[];

  @ApiProperty({ type: AchievementStatsDto, description: 'Estadísticas de logros del usuario' })
  @Column('jsonb')
  achievementStats: AchievementStatsDto;

  @ApiProperty({ type: BadgeStatsDto, description: 'Estadísticas de insignias del usuario' })
  @Column('jsonb')
  badgeStats: BadgeStatsDto;

  @ApiProperty({ type: LearningPathDto, description: 'Ruta de aprendizaje del usuario' })
  @Column('jsonb')
  learningPath: LearningPathDto;

  @ApiProperty({ description: 'Fecha de creación de las estadísticas', example: '2023-01-01T00:00:00Z' })
  @CreateDateColumn()
  createdAt: string;

  @ApiProperty({ description: 'Fecha de última actualización de las estadísticas', example: '2023-12-31T23:59:59Z' })
  @UpdateDateColumn()
  updatedAt: string;
}
