import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        description: 'El correo electrónico del usuario',
        example: 'juan.perez@example.com',
    })
    @IsEmail()
    email: string;

    @ApiProperty({
        description: 'La contraseña del usuario',
        example: 'password123',
    })
    @IsString()
    @IsNotEmpty()
    password: string;
} 