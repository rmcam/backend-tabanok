import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsNotEmpty } from 'class-validator';

export class CompleteExerciseDto {
  @ApiProperty({ description: 'Respuestas del ejercicio en formato JSON', example: { question1: 'answerA', question2: 'answerB' } })
  @IsNotEmpty({ message: 'Las respuestas no pueden estar vacías' })
  @IsObject({ message: 'Las respuestas deben ser un objeto válido' })
  answers: Record<string, any>;
}
