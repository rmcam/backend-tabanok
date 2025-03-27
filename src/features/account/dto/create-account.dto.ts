import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsUUID } from 'class-validator';

export class CreateAccountDto {
    @ApiProperty({
        description: 'ID del usuario al que pertenece la cuenta',
        example: '123e4567-e89b-12d3-a456-426614174000',
    })
    @IsUUID()
    userId: string;

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