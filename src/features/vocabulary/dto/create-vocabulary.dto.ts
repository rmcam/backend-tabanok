import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateVocabularyDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    wordSpanish: string;

    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    wordKamentsa: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    pronunciation?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    example?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    exampleTranslation?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    description?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    audioUrl?: string;

    @ApiProperty({ required: false })
    @IsString()
    @IsOptional()
    imageUrl?: string;

    @ApiProperty()
    @IsUUID()
    @IsNotEmpty()
    topicId: string;
} 