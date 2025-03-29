import { Body, Controller, Get, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { ChangePasswordDto, LoginDto, RegisterDto, RequestPasswordResetDto, ResetPasswordDto, UpdateProfileDto } from './dto/auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('login')
    @ApiOperation({ summary: 'Iniciar sesión', description: 'Permite a un usuario iniciar sesión en el sistema' })
    @ApiResponse({ status: 200, description: 'Usuario autenticado exitosamente', type: LoginDto })
    @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Post('register')
    @ApiOperation({
        summary: 'Registrar nuevo usuario',
        description: 'Crea una nueva cuenta de usuario en el sistema'
    })
    @ApiResponse({ status: 201, description: 'Usuario registrado exitosamente', type: RegisterDto })
    @ApiResponse({ status: 400, description: 'Datos de registro inválidos' })
    @ApiResponse({ status: 409, description: 'El usuario ya existe' })
    async register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Get('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Obtener perfil',
        description: 'Obtiene la información del perfil del usuario autenticado'
    })
    @ApiResponse({ status: 200, description: 'Perfil obtenido exitosamente' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    async getProfile(@Request() req) {
        return req.user;
    }

    @Put('profile')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Actualizar perfil',
        description: 'Actualiza la información del perfil del usuario autenticado'
    })
    @ApiResponse({ status: 200, description: 'Perfil actualizado exitosamente', type: UpdateProfileDto })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    async updateProfile(@Request() req, @Body() updateProfileDto: UpdateProfileDto) {
        return this.authService.updateProfile(req.user.id, updateProfileDto);
    }

    @Post('password/change')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({
        summary: 'Cambiar contraseña',
        description: 'Permite al usuario cambiar su contraseña actual'
    })
    @ApiResponse({ status: 200, description: 'Contraseña cambiada exitosamente' })
    @ApiResponse({ status: 401, description: 'No autorizado' })
    @ApiResponse({ status: 400, description: 'Contraseña actual incorrecta' })
    async changePassword(@Request() req, @Body() changePasswordDto: ChangePasswordDto) {
        return this.authService.changePassword(req.user.id, changePasswordDto);
    }

    @Post('password/reset/request')
    @ApiOperation({
        summary: 'Solicitar restablecimiento de contraseña',
        description: 'Envía un correo con instrucciones para restablecer la contraseña'
    })
    @ApiResponse({ status: 200, description: 'Correo enviado exitosamente' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    async requestPasswordReset(@Body() requestPasswordResetDto: RequestPasswordResetDto) {
        return this.authService.requestPasswordReset(requestPasswordResetDto);
    }

    @Post('reset-password')
    @ApiOperation({ summary: 'Restablecer contraseña' })
    async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<void> {
        const { token, newPassword } = resetPasswordDto;
        return this.authService.resetPassword(token, newPassword);
    }
} 