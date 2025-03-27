import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
    @ApiProperty({
        description: 'El nombre del usuario',
        example: 'Juan',
    })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({
        description: 'El apellido del usuario',
        example: 'Pérez',
    })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({
        description: 'El correo electrónico del usuario',
        example: 'juan.perez@example.com',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'La contraseña del usuario',
        example: 'password123',
        minLength: 8,
    })
    @IsString()
    @IsNotEmpty()
    @MinLength(8)
    password: string;
} 