import { AutoGradingResult, GradingCriteria } from '../interfaces/auto-grading.interface';
import { ApiProperty } from '@nestjs/swagger';

export class AutoGradingResultDto implements AutoGradingResult {
    @ApiProperty({ description: 'Puntuación total de la calificación automática' })
    score: number;

    @ApiProperty({ description: 'Desglose de la puntuación por criterio' })
    breakdown: GradingCriteria;

    @ApiProperty({ description: 'Comentarios generados durante la calificación' })
    feedback: string[];

    @ApiProperty({ description: 'Sugerencias generadas durante la calificación' })
    suggestions: string[];

    @ApiProperty({ description: 'Nivel de confianza en la calificación' })
    confidence: number;
}
