import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class ProgressMetricsDto {
  @ApiProperty({ description: 'Métrica de pronunciación (0-100)', example: 85 })
  @IsNumber()
  @IsInt()
  @Min(0)
  @Max(100)
  pronunciation: number;

  @ApiProperty({ description: 'Métrica de comprensión (0-100)', example: 90 })
  @IsNumber()
  @IsInt()
  @Min(0)
  @Max(100)
  comprehension: number;

  @ApiProperty({ description: 'Métrica de escritura (0-100)', example: 70 })
  @IsNumber()
  @IsInt()
  @Min(0)
  @Max(100)
  writing: number;

  @ApiProperty({ description: 'Métrica de vocabulario (0-100)', example: 95 })
  @IsNumber()
  @IsInt()
  @Min(0)
  @Max(100)
  vocabulary: number;
}
