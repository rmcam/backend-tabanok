import { ApiProperty } from '@nestjs/swagger';

class GamificationStatsDto {
  @ApiProperty({ description: 'Total de puntos del usuario' })
  points: number;

  @ApiProperty({ description: 'Nivel actual del usuario' })
  level: number;

  @ApiProperty({ description: 'Estadísticas de juego (placeholder)' })
  gameStats: any;

  @ApiProperty({ description: 'Lista de logros del usuario (placeholder)' })
  achievements: any[];

  @ApiProperty({ description: 'Lista de recompensas del usuario (placeholder)' })
  rewards: any[];

  @ApiProperty({ description: 'Puntos culturales del usuario (placeholder)' })
  culturalPoints: number;
}

class LearningStatsDto {
  @ApiProperty({ description: 'Total de lecciones completadas' })
  completedLessons: number;

  @ApiProperty({ description: 'Total de lecciones disponibles (placeholder)' })
  totalLessons: number;

  @ApiProperty({ description: 'Puntuación promedio en ejercicios' })
  averageScore: number;

  @ApiProperty({ description: 'Tiempo total invertido en minutos' })
  timeSpent: number;
}

export class UserStatisticsResponseDto {
  @ApiProperty({ type: GamificationStatsDto, description: 'Estadísticas de gamificación del usuario' })
  gamification: GamificationStatsDto;

  @ApiProperty({ type: LearningStatsDto, description: 'Estadísticas de aprendizaje del usuario' })
  learning: LearningStatsDto;
}
