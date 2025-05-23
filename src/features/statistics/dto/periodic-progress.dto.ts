import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsObject } from 'class-validator';
import { BaseProgress } from '../interfaces/periodic-progress.interface';

export class PeriodicProgressDto implements BaseProgress {
  @ApiProperty({ description: 'Fecha del progreso (ISO 8601)', example: '2023-10-26T10:00:00.000Z' })
  @IsString()
  date: string;

  @ApiProperty({ description: 'Lecciones completadas en el período', example: 5 })
  @IsNumber()
  lessonsCompleted: number;

  @ApiProperty({ description: 'Ejercicios completados en el período', example: 30 })
  @IsNumber()
  exercisesCompleted: number;

  @ApiProperty({ description: 'Puntuación promedio en el período', example: 89.0 })
  @IsNumber()
  averageScore: number;

  @ApiProperty({ description: 'Tiempo dedicado en el período en minutos', example: 300 })
  @IsNumber()
  timeSpentMinutes: number;

  @ApiProperty({ description: 'Metas diarias logradas', example: 2 })
  @IsNumber()
  dailyGoalsAchieved: number;

  @ApiProperty({ description: 'Total de metas diarias', example: 3 })
  @IsNumber()
  dailyGoalsTotal: number;

  @ApiProperty({ description: 'Puntuación de enfoque', example: 85 })
  @IsNumber()
  focusScore: number;

  @ApiProperty({
    description: 'Métricas de consistencia',
    type: 'object',
    properties: {
      daysActive: { type: 'number' },
      totalSessions: { type: 'number' },
      averageSessionDuration: { type: 'number' },
      preferredTimeOfDay: { type: 'string' },
      regularityScore: { type: 'number' },
      dailyStreak: { type: 'number' },
      weeklyCompletion: { type: 'number' },
      timeDistribution: { type: 'object', additionalProperties: { type: 'number' } },
    },
  })
  @IsObject()
  @IsOptional()
  consistencyMetrics: {
    daysActive: number;
    totalSessions: number;
    averageSessionDuration: number;
    preferredTimeOfDay: string;
    regularityScore: number;
    dailyStreak: number;
    weeklyCompletion: number;
    timeDistribution: Record<string, number>;
  };
}
