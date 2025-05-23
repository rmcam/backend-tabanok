import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsObject, IsArray, IsOptional } from 'class-validator';

export class AchievementStatsDto {
  @ApiProperty({ description: 'Total de logros obtenidos', example: 15 })
  @IsNumber()
  totalAchievements: number;

  @ApiProperty({ description: 'Logros por categoría', example: { grammar: 5, vocabulary: 7, cultural: 3 } })
  @IsObject()
  achievementsByCategory: Record<string, number>;

  @ApiProperty({ description: 'Fecha del último logro obtenido', example: '2023-10-26T10:00:00Z' })
  @IsString()
  lastAchievementDate: string;

  @ApiProperty({ description: 'Logros especiales obtenidos', example: ['first_lesson', 'perfect_score'], isArray: true })
  @IsArray()
  @IsString({ each: true })
  specialAchievements: string[];
}
