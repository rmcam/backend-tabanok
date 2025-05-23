import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateAchievementStatsDto {
  @ApiProperty({ description: 'Categoría del logro a actualizar', example: 'grammar' })
  @IsString()
  @IsNotEmpty()
  achievementCategory: string;
}
