import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsObject, IsString, MinLength, ValidateNested } from 'class-validator';

export class ProfileDto {
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
}

export class RegisterDto {
    @ApiProperty({
        description: 'Nombre de usuario',
        example: 'juan.perez'
    })
    @IsString()
    @IsNotEmpty()
    username: string;

    @ApiProperty({
        description: 'Información del perfil del usuario'
    })
    @IsObject()
    @ValidateNested()
    @Type(() => ProfileDto)
    profile: ProfileDto;

    @ApiProperty({
        description: 'El correo electrónico del usuario',
        example: 'juan.perez@example.com',
    })
    @IsEmail()
    @IsNotEmpty()
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