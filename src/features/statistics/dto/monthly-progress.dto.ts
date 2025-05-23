import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, IsObject } from 'class-validator';
import { BaseProgress } from '../interfaces/periodic-progress.interface';

export class MonthlyProgressDto implements BaseProgress {
  @ApiProperty({ description: 'Mes del año (YYYY-MM)', example: '2023-10' })
  @IsString()
  month: string;

  @ApiProperty({ description: 'Fecha de inicio del mes (ISO 8601)', example: '2023-10-01T00:00:00.000Z' })
  @IsString()
  monthStartDate: string;

  @ApiProperty({ description: 'Lecciones completadas en el mes', example: 8 })
  @IsNumber()
  lessonsCompleted: number;

  @ApiProperty({ description: 'Ejercicios completados en el mes', example: 60 })
  @IsNumber()
  exercisesCompleted: number;

  @ApiProperty({ description: 'Puntuación promedio en el mes', example: 90.1 })
  @IsNumber()
  averageScore: number;

  @ApiProperty({ description: 'Tiempo dedicado en el mes en minutos', example: 720 })
  @IsNumber()
  timeSpentMinutes: number;

  @ApiProperty({ description: 'Metas mensuales logradas', example: 3 })
  @IsNumber()
  monthlyGoalsAchieved: number;

  @ApiProperty({ description: 'Total de metas mensuales', example: 5 })
  @IsNumber()
  monthlyGoalsTotal: number;

  @ApiProperty({ description: 'Tasa de mejora respecto al mes anterior', example: 5.2 })
  @IsNumber()
  improvementRate: number;

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
