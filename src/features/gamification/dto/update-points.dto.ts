import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty } from 'class-validator';

export class UpdatePointsDto {
    @ApiProperty({
        description: 'Número de puntos a añadir (puede ser negativo)',
        example: 10,
        type: Number,
    })
    @IsNotEmpty({ message: 'Los puntos no pueden estar vacíos' })
    @IsInt({ message: 'Los puntos deben ser un número entero' })
    points: number;
}
