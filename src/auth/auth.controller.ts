import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  Headers,
  Post,
  Put,
  Request,
  Res,
  UnauthorizedException,
  UseGuards,
  UsePipes,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Response } from "express";
import { CustomValidationPipe } from "../common/pipes/custom-validation.pipe";
import { AuthService } from "./auth.service";
import { Public } from "./decorators/public.decorator";
import {
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  RequestPasswordResetDto,
  ResetPasswordDto,
  UpdateProfileDto,
} from "./dto/auth.dto";
import { User } from "./entities/user.entity";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {}

  @UsePipes(new CustomValidationPipe({ transform: true }))
  @Public() // Marcar esta ruta como pública
  @Post("signin")
  @ApiOperation({
    summary: "Iniciar sesión",
    description: "Permite a un usuario iniciar sesión en el sistema",
  })
  @ApiResponse({
    status: 200,
    description: "Usuario autenticado exitosamente",
    type: LoginDto,
  })
  @ApiResponse({ status: 401, description: "Credenciales inválidas" })
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    try {
      const { accessToken, refreshToken } =
        await this.authService.login(loginDto);

      const secure = this.configService.get("NODE_ENV") === "production"; // Asegurar secure: true en producción
      // const domain = this.configService.get<string>('DOMAIN'); // No especificar dominio explícito
      res.cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: secure,
        sameSite: "None",
      }); // Cambiado a None
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: secure,
        sameSite: "None",
      }); // Cambiado a None

      return { message: "Login successful" };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @UsePipes(new CustomValidationPipe({ transform: true }))
  @Public() // Marcar esta ruta como pública
  @Post("signup")
  @ApiOperation({
    summary: "Registrar nuevo usuario",
    description: "Crea una nueva cuenta de usuario en el sistema",
  })
  @ApiResponse({
    status: 201,
    description: "Usuario registrado exitosamente",
    type: RegisterDto,
  })
  @ApiResponse({ status: 400, description: "Datos de registro inválidos" })
  @ApiResponse({ status: 409, description: "El usuario ya existe" })
  async register(@Body() registerDto: RegisterDto) {
    try {
      return await this.authService.register(registerDto);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  @Get("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Obtener perfil",
    description: "Obtiene la información del perfil del usuario autenticado",
  })
  @ApiResponse({ status: 200, description: "Perfil obtenido exitosamente" })
  @ApiResponse({ status: 401, description: "No autorizado" })
  async getProfile(@Request() req) {
    return req.user;
  }

  @Get("validate")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Validar token",
    description: "Valida un token de acceso JWT",
  })
  async validateToken(@Headers("Authorization") authorization: string) {
    const token = authorization?.split(" ")[1];
    if (!token) {
      return { isValid: false };
    }
    const payload = await this.authService.validateToken(token);
    return { isValid: !!payload };
  }

  @Put("profile")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Actualizar perfil",
    description: "Actualiza la información del perfil del usuario autenticado",
  })
  @ApiResponse({
    status: 200,
    description: "Perfil actualizado exitosamente",
    type: UpdateProfileDto,
  })
  @ApiResponse({ status: 401, description: "No autorizado" })
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto
  ) {
    return this.authService.updateProfile(req.user.id, updateProfileDto);
  }

  @Post("password/change")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: "Cambiar contraseña",
    description: "Permite al usuario cambiar su contraseña actual",
  })
  @ApiResponse({ status: 200, description: "Contraseña cambiada exitosamente" })
  @ApiResponse({ status: 401, description: "No autorizado" })
  @ApiResponse({ status: 400, description: "Contraseña actual incorrecta" })
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto
  ) {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @Post("password/reset/request")
  @ApiOperation({
    summary: "Solicitar restablecimiento de contraseña",
    description:
      "Envía un correo con instrucciones para restablecer la contraseña",
  })
  @ApiResponse({ status: 200, description: "Correo enviado exitosamente" })
  @ApiResponse({ status: 404, description: "Usuario no encontrado" })
  async requestPasswordReset(
    @Body() requestPasswordResetDto: RequestPasswordResetDto
  ) {
    return this.authService.requestPasswordReset(requestPasswordResetDto);
  }

  @Post("reset-password")
  @ApiOperation({ summary: "Restablecer contraseña" })
  async resetPassword(
    @Body() resetPasswordDto: ResetPasswordDto
  ): Promise<void> {
    const { token, newPassword } = resetPasswordDto;
    return this.authService.resetPassword(token, newPassword);
  }

  @Post("refresh-token")
  @ApiOperation({ summary: "Renovar token de acceso" })
  @ApiResponse({ status: 200, description: "Tokens renovados exitosamente" })
  @ApiResponse({
    status: 401,
    description: "Refresh token inválido o expirado",
  })
  async refreshTokens(
    @Request() req,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken = req.cookies["refreshToken"];
    if (!refreshToken) {
      throw new UnauthorizedException("Refresh token not found");
    }
    const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshTokens(refreshToken);

    const secure = this.configService.get("NODE_ENV") === "production"; // Asegurar secure: true en producción
    // const domain = this.configService.get<string>('DOMAIN'); // No especificar dominio explícito
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: secure,
      sameSite: "None",
    }); // Cambiado a None
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: secure,
      sameSite: "None",
    }); // Cambiado a None

    return { message: "Tokens refreshed successfully" };
  }

  @Get("verify-session")
  @UseGuards(JwtAuthGuard) // Asume que JwtAuthGuard verifica la cookie HttpOnly
  @ApiBearerAuth() // Documentación para Swagger, aunque la auth sea por cookie
  @ApiOperation({
    summary: "Verificar sesión",
    description:
      "Verifica la validez de la sesión actual basada en la cookie HttpOnly y devuelve los datos del usuario si es válida.",
  })
  @ApiResponse({ status: 200, description: "Sesión válida", type: User }) // Asume que User entity puede ser devuelta
  @ApiResponse({ status: 401, description: "Sesión inválida o ausente" })
  async verifySession(@Request() req) {
    // Si el JwtAuthGuard pasa, req.user contendrá los datos del usuario
    return req.user;
  }

  @Post('signout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cerrar sesión' })
  async signout(@Request() req, @Res({ passthrough: true }) res: Response) {
    // Eliminar las cookies de acceso y refresh
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    return { message: 'Signout successful' };
  }
}
