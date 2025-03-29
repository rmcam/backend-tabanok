import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateAccountDto {
    @ApiProperty({ description: 'ID del usuario asociado' })
    @IsUUID()
    userId: string;

    @ApiProperty({ description: 'Puntos de la cuenta', default: 0 })
    @IsNumber()
    @IsOptional()
    points?: number = 0;

    @ApiProperty({ description: 'Nivel de la cuenta', default: 1 })
    @IsNumber()
    @IsOptional()
    level?: number = 1;

    @ApiProperty({
        description: 'La racha actual del usuario',
        example: 0,
        required: false,
    })
    @IsNumber()
    @IsOptional()
    streak?: number;

    @ApiProperty({
        description: 'Configuración de la cuenta',
        example: { theme: 'dark', language: 'es' },
        required: false,
    })
    @IsOptional()
    settings?: Record<string, any>;

    @ApiProperty({
        description: 'Preferencias del usuario',
        example: { notifications: true, sound: false },
        required: false,
    })
    @IsOptional()
    preferences?: Record<string, any>;
} 