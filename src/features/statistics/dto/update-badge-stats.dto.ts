import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class UpdateBadgeStatsDto {
  @ApiProperty({ description: 'Nivel de la insignia a actualizar', example: 'gold' })
  @IsString()
  @IsNotEmpty()
  badgeTier: string;
}
