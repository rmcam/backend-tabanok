import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { UserRole, UserStatus } from '../../../auth/entities/user.entity';

export class CreateUserDto {
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
} 