import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole, UserStatus } from '../../../auth/enums/auth.enum';

export class CreateUserDto {
  username: string;
    @ApiProperty({ description: 'Nombre del usuario' })
    @IsString()
    firstName: string;

    @ApiProperty({ description: 'Apellido del usuario' })
    @IsString()
    lastName: string;

    @ApiProperty({ description: 'Correo electrónico del usuario' })
    @IsEmail()
    email: string;

    @ApiProperty({ description: 'Contraseña del usuario' })
    @IsString()
    @MinLength(6)
    password: string;

    @ApiProperty({
        description: 'Rol del usuario',
        enum: UserRole,
        default: UserRole.USER
    })
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;

    @ApiProperty({
        description: 'Estado del usuario',
        enum: UserStatus,
        default: UserStatus.ACTIVE
    })
    @IsEnum(UserStatus)
    @IsOptional()
    status?: UserStatus;

    @ApiProperty({ description: 'URL del avatar', required: false })
    @IsString()
    @IsOptional()
    avatarUrl?: string;

    @ApiProperty({ description: 'Idiomas que maneja el usuario' })
    @IsArray()
    @IsOptional()
    languages?: string[] = [];

    @ApiProperty({ description: 'Preferencias del usuario', required: false })
    @IsOptional()
    preferences?: {
        notifications: boolean;
        language: string;
        theme: string;
    };

    @ApiProperty({ description: 'País del usuario', required: false })
    @IsString()
    @IsOptional()
    country?: string;

    @ApiProperty({ description: 'Ciudad del usuario', required: false })
    @IsString()
    @IsOptional()
    city?: string;
}
