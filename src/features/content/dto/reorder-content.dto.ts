import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsUUID, Min } from 'class-validator';

export class ContentOrderItem {
    @ApiProperty({
        description: 'ID del contenido',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    id: string;

    @ApiProperty({
        description: 'Nueva posición del contenido',
        example: 1,
        minimum: 1,
    })
    @IsNumber()
    @Min(1)
    order: number;
}

export class ReorderContentDto {
    @ApiProperty({
        description: 'Lista de contenidos con sus nuevas posiciones',
        type: [ContentOrderItem],
    })
    @IsArray()
    items: ContentOrderItem[];
} 