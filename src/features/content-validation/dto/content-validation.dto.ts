import { ApiProperty } from "@nestjs/swagger";
import { ContentType } from "../interfaces/content-validation.interface";

export class SubmitValidationDto {
    @ApiProperty({ description: 'ID del contenido' })
    contentId: string;

    @ApiProperty({ description: 'Tipo de contenido' })
    contentType: ContentType;

    @ApiProperty({ description: 'Contenido original' })
    originalContent: string;

    @ApiProperty({ description: 'Contenido traducido' })
    translatedContent: string;

    @ApiProperty({ description: 'ID del usuario que envió el contenido' })
    submittedBy: string;

    @ApiProperty({ description: 'Contexto cultural', required: false })
    culturalContext?: string;

    @ApiProperty({ description: 'Variación dialectal', required: false })
    dialectVariation?: string;
}

export class ValidateContentDto {
    @ApiProperty({ description: 'ID del validador' })
    validatorId: string;

    @ApiProperty({ description: 'Criterios de validación' })
    criteria: {
        spelling: boolean;
        grammar: boolean;
        culturalAccuracy: boolean;
        contextualUse: boolean;
        pronunciation: boolean;
    };

    @ApiProperty({ description: 'Comentarios y sugerencias' })
    feedback: {
        criteriaId: string;
        comment: string;
        suggestedCorrection?: string;
    };
}

export class AddCommunityVoteDto {
    @ApiProperty({ description: 'ID del usuario que vota' })
    userId: string;

    @ApiProperty({ description: 'Indica si el voto es positivo' })
    isUpvote: boolean;
}

export class AddUsageExampleDto {
    @ApiProperty({ description: 'Ejemplo de uso' })
    example: string;
}

export class UpdateAudioReferenceDto {
    @ApiProperty({ description: 'URL del audio' })
    audioUrl: string;
}
