import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsString } from 'class-validator';

export class ValidationResultDto {
  @ApiProperty({ description: 'Indica si el texto es válido', example: true })
  @IsBoolean()
  isValid: boolean;

  @ApiProperty({ description: 'Lista de errores encontrados en el texto', type: [String], example: ['Error gramatical: "ts" debe ser "ts̈"'] })
  @IsArray()
  @IsString({ each: true })
  errors: string[];

  @ApiProperty({ description: 'Lista de sugerencias para mejorar el texto', type: [String], example: ['Sugerencia: Use "ts̈ëngbe" en lugar de "tsengbe"'] })
  @IsArray()
  @IsString({ each: true })
  suggestions: string[];
}
