import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, Validate, ValidateIf } from 'class-validator';
import { UserRole } from '../enums/auth.enum';
import { IsPasswordStrong } from '../../common/validators/password.validator';

export class LoginDto {
    @ApiProperty({ description: 'Usuario o correo institucional' })
    @IsString({ message: 'El identificador debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El identificador no debe estar vacío.' })
    identifier: string;

    @ApiProperty({ description: 'Contraseña del usuario' })
    @IsString({ message: 'La contraseña debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'La contraseña no debe estar vacío.' })
    @Validate(IsPasswordStrong)
    password: string;
}

export class RegisterDto {
    @ApiProperty({ description: 'Nombre de usuario institucional' })
    @IsString({ message: 'El nombre de usuario debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El nombre de usuario no debe estar vacío.' })
    username: string;

    @ApiProperty({ description: 'Primer Nombre del usuario' })
    @IsString({ message: 'El nombre debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El nombre no debe estar vacío.' })
    firstName: string;

    @ApiProperty({ description: 'Segundo Nombre del usuario', required: false })
    @IsString({ message: 'El nombre debe ser una cadena de texto.' })
    @IsOptional()
    secondName: string = '';

    @ApiProperty({ description: 'Primer Apellido del usuario' })
    @IsString({ message: 'El apellido debe ser una cadena de texto.' })
    @IsNotEmpty({ message: 'El apellido no debe estar vacío.' })
    firstLastName: string;

    @ApiProperty({ description: 'Segundo Apellido del usuario', required: false })
    @IsString({ message: 'El apellido debe ser una cadena de texto.' })
    @IsOptional()
    secondLastName: string = '';

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

    @ApiProperty({ description: 'País del usuario', required: false })
    @IsString()
    @IsOptional()
    country?: string;

    @ApiProperty({ description: 'Ciudad del usuario', required: false })
    @IsString()
    @IsOptional()
    city?: string;
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
