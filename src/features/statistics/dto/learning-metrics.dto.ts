import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsString, IsDateString } from 'class-validator';

export class LearningMetricsDto {
  @ApiProperty({ description: 'Total de lecciones completadas', example: 25 })
  @IsNumber()
  totalLessonsCompleted: number;

  @ApiProperty({ description: 'Total de ejercicios completados', example: 150 })
  @IsNumber()
  totalExercisesCompleted: number;

  @ApiProperty({ description: 'Puntuación promedio general', example: 88.2 })
  @IsNumber()
  averageScore: number;

  @ApiProperty({ description: 'Tiempo total dedicado en minutos', example: 1500 })
  @IsNumber()
  totalTimeSpentMinutes: number;

  @ApiProperty({ description: 'Racha más larga de estudio', example: 15 })
  @IsNumber()
  longestStreak: number;

  @ApiProperty({ description: 'Racha actual de estudio', example: 7 })
  @IsNumber()
  currentStreak: number;

  @ApiProperty({ description: 'Fecha de la última actividad', example: '2023-10-26T10:00:00Z', nullable: true })
  @IsOptional()
  @IsDateString()
  lastActivityDate: string | null;

  @ApiProperty({ description: 'Puntuación total de maestría', example: 0.92 })
  @IsNumber()
  totalMasteryScore: number;
}
