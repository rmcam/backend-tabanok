import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Validate } from 'class-validator';
import { UserRole } from '../entities/user.entity'; // Ruta corregida
import { IsPasswordStrong } from '../../common/validators/password.validator';

export class LoginDto {
    @ApiProperty({ description: 'Correo electrónico del usuario' })
    @IsEmail({}, { message: 'El correo electrónico debe ser válido.' })
    email: string;

    @ApiProperty({ description: 'Contraseña del usuario' })
    @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
    @Validate(IsPasswordStrong)
    password: string;
}

export class RegisterDto {
    @ApiProperty({ description: 'Nombre del usuario' })
    @IsString({ message: 'El nombre debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El nombre no debe estar vacío.' })
    firstName: string;

    @ApiProperty({ description: 'Apellido del usuario' })
    @IsString({ message: 'El apellido debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El apellido no debe estar vacío.' })
    lastName: string;

    @ApiProperty({ description: 'Correo electrónico del usuario' })
    @IsEmail({}, { message: 'El correo electrónico debe ser válido.' })
    email: string;

    @ApiProperty({ description: 'Contraseña del usuario' })
    @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
    @Validate(IsPasswordStrong)
    password: string;

    @ApiProperty({ description: 'Idiomas que habla el usuario', required: false })
    @IsArray()
    @IsOptional()
    languages?: string[];

    @ApiProperty({ description: 'Preferencias del usuario', required: false })
    @IsOptional()
    preferences?: {
        notifications: boolean;
        language: string;
        theme: string;
    };

    @ApiProperty({ description: 'Rol del usuario', enum: UserRole, required: false })
    @IsEnum(UserRole)
    @IsOptional()
    role?: UserRole;
}

export class UpdateProfileDto {
    @ApiProperty({ description: 'Nombre del usuario', required: false })
    @IsString()
    @IsOptional()
    firstName?: string;

    @ApiProperty({ description: 'Apellido del usuario', required: false })
    @IsString()
    @IsOptional()
    lastName?: string;

    @ApiProperty({ description: 'URL del avatar', required: false })
    @IsString()
    @IsOptional()
    avatarUrl?: string;

    @ApiProperty({ description: 'Idiomas que habla el usuario', required: false })
    @IsArray()
    @IsOptional()
    languages?: string[];

    @ApiProperty({ description: 'Preferencias del usuario', required: false })
    @IsOptional()
    preferences?: {
        notifications: boolean;
        language: string;
        theme: string;
    };

    @ApiProperty({ description: 'Perfil del usuario', required: false })
    @IsOptional()
    profile?: {
        bio: string;
        location: string;
        interests: string[];
        community?: string;
    };
}

export class ChangePasswordDto {
    @ApiProperty({ description: 'Contraseña actual' })
    @IsString()
    currentPassword: string;

    @ApiProperty({ description: 'Nueva contraseña' })
    @IsString()
    @Validate(IsPasswordStrong)
    newPassword: string;
}

export class ResetPasswordDto {
    @ApiProperty({ description: 'Token de restablecimiento de contraseña' })
    @IsString()
    @IsNotEmpty()
    token: string;

    @ApiProperty({ description: 'Nueva contraseña' })
    @IsString()
    @Validate(IsPasswordStrong)
    newPassword: string;
}

export class RequestPasswordResetDto {
    @ApiProperty({ description: 'Correo electrónico del usuario' })
    @IsEmail({}, { message: 'El correo electrónico debe ser válido.' })
    email: string;
}
