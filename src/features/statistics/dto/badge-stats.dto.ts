import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsObject, IsArray, IsOptional } from 'class-validator';

export class BadgeStatsDto {
  @ApiProperty({ description: 'Total de insignias obtenidas', example: 7 })
  @IsNumber()
  totalBadges: number;

  @ApiProperty({ description: 'Insignias por nivel', example: { bronze: 2, silver: 3, gold: 2 } })
  @IsObject()
  badgesByTier: Record<string, number>;

  @ApiProperty({ description: 'Fecha de la última insignia obtenida', example: '2023-10-26T10:00:00Z' })
  @IsString()
  lastBadgeDate: string;

  @ApiProperty({ description: 'Insignias activas', example: ['explorer', 'linguist'], isArray: true })
  @IsArray()
  @IsString({ each: true })
  activeBadges: string[];
}
