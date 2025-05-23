import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CompareVersionsDto {
  @ApiProperty({ description: 'ID de la primera versión a comparar', example: 'uuid-version-1' })
  @IsString()
  @IsNotEmpty()
  versionId1: string;

  @ApiProperty({ description: 'ID de la segunda versión a comparar', example: 'uuid-version-2' })
  @IsString()
  @IsNotEmpty()
  versionId2: string;
}
