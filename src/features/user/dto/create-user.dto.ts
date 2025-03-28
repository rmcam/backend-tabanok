import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsEmail, IsNotEmpty, IsObject, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Role } from '../../auth/enums/role.enum';

export class UserProfileDto {
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

export class CreateUserDto {
    @ApiProperty({
        description: 'Información del perfil del usuario'
    })
    @IsObject()
    @ValidateNested()
    @Type(() => UserProfileDto)
    profile: UserProfileDto;

    @ApiProperty({
        description: 'El nombre de usuario',
        example: 'juan.perez'
    })
    @IsString()
    @IsNotEmpty()
    username: string;

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

    @ApiProperty({
        description: 'Los roles del usuario',
        example: [Role.USER],
        required: false,
    })
    @IsArray()
    @IsOptional()
    roles?: Role[];
} 