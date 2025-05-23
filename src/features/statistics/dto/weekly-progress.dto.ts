import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsObject } from 'class-validator';
import { BaseProgress } from '../interfaces/periodic-progress.interface';

export class WeeklyProgressDto implements BaseProgress {
  @ApiProperty({ description: 'Semana del año (YYYY-WW)', example: '2023-43' })
  @IsString()
  week: string;

  @ApiProperty({ description: 'Fecha de inicio de la semana (ISO 8601)', example: '2023-10-23T00:00:00.000Z' })
  @IsString()
  weekStartDate: string;

  @ApiProperty({ description: 'Lecciones completadas en la semana', example: 2 })
  @IsNumber()
  lessonsCompleted: number;

  @ApiProperty({ description: 'Ejercicios completados en la semana', example: 15 })
  @IsNumber()
  exercisesCompleted: number;

  @ApiProperty({ description: 'Puntuación promedio en la semana', example: 88.5 })
  @IsNumber()
  averageScore: number;

  @ApiProperty({ description: 'Tiempo dedicado en la semana en minutos', example: 180 })
  @IsNumber()
  timeSpentMinutes: number;

  @ApiProperty({ description: 'Metas semanales logradas', example: 3 })
  @IsNumber()
  weeklyGoalsAchieved: number;

  @ApiProperty({ description: 'Total de metas semanales', example: 5 })
  @IsNumber()
  weeklyGoalsTotal: number;

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
