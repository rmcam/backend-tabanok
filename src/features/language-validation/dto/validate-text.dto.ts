import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class ValidateTextDto {
  @ApiProperty({ description: 'Texto a validar en Kamëntsá', example: 'Jajun' })
  @IsString()
  @IsNotEmpty()
  text: string;
}
