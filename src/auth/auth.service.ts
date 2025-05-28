import { HttpService } from "@nestjs/axios";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RevokedToken } from './entities/revoked-token.entity';
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";

import * as argon2 from "argon2";
import { v4 as uuidv4 } from "uuid";
import { StatisticsService } from "../features/statistics/statistics.service";
import { UserService } from "../features/user/user.service";
import { MailService } from "../lib/mail.service"; // Importar MailService
import {
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  UpdateProfileDto,
} from "./dto/auth.dto";
import { User } from "./entities/user.entity"; // <-- Ruta corregida

/**
 * @description Servicio de autenticación para la aplicación.
 * Proporciona métodos para registrar, iniciar sesión, actualizar perfiles, cambiar contraseñas y restablecer contraseñas.
 */
@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly userService: UserService, // <-- UserService se mantiene
    private readonly mailService: MailService, // Inyectar MailService
    private readonly statisticsService: StatisticsService,
    private readonly httpService: HttpService,
    @InjectRepository(RevokedToken)
    private readonly revokedTokenRepository: Repository<RevokedToken>,
  ) {}

  /**
   * @description Renueva tokens usando un refresh token válido.
   * @param refreshToken El refresh token enviado por el cliente.
   * @returns Nuevos tokens si el refresh token es válido.
   * @throws {UnauthorizedException} Si el refresh token es inválido o expiró.
   */
  async refreshTokens(
    refreshToken: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret:
          this.configService.get<string>("JWT_REFRESH_SECRET") ||
          this.configService.get<string>("JWT_SECRET"),
      });

      const revokedToken = await this.revokedTokenRepository.findOne({ where: { token: refreshToken } });
      if (revokedToken) {
        throw new UnauthorizedException("Refresh token revocado");
      }

      const user = await this.userService.findOne(payload.sub);
      if (!user) {
        throw new UnauthorizedException("Usuario no encontrado");
      }

      const tokens = await this.generateToken(user);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException("Refresh token inválido o expirado");
    }
  }

  /**
   * @description Registra un nuevo usuario en la aplicación.
   * @param registerDto Datos del usuario a registrar.
   * @returns Un objeto con la información del usuario y el token de acceso.
   * @throws {BadRequestException} Si el correo electrónico ya está registrado.
   */
  async register(registerDto: RegisterDto): Promise<any> {
    const {
      username,
      email,
      password,
      firstName,
      secondName,
      firstLastName,
      secondLastName,
      languages,
      preferences,
      role,
    } = registerDto;

    const existingEmail = await this.userService.findByEmailOptional(email);
    if (existingEmail) {
      throw new ConflictException("El correo electrónico ya está registrado");
    }

    // Validar username único
    const existingUsername =
      await this.userService.findByUsernameOptional(username);
    if (existingUsername) {
      throw new BadRequestException("El nombre de usuario ya está registrado");
    }

    const lastName = `${firstLastName ?? ""} ${secondLastName ?? ""}`.trim();

    const hashedPassword = await argon2.hash(password);

    let user: User;
    try {
      user = await this.userService.create({
        username,
        email,
        password: hashedPassword,
        firstName,
        lastName,
        languages,
        preferences,
        role,
      });
    } catch (error) {
      throw new BadRequestException("Error al registrar el usuario");
    }

    // Crear estadísticas del usuario
    await this.statisticsService.create({ userId: user.id });

    // Actualizar la fecha del último inicio de sesión
    await this.userService.updateLastLogin(user.id);

    const tokens = await this.generateToken(user);

    return {
      statusCode: 201,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
    };
  }

  /**
   * @description Inicia sesión un usuario en la aplicación.
   * @param loginDto Datos del usuario a iniciar sesión.
   * @returns Un objeto con la información del usuario y el token de acceso.
   * @throws {UnauthorizedException} Si las credenciales son inválidas o la cuenta no está activa.
   */
  async login(loginDto: LoginDto): Promise<any> {
    const { identifier, password } = loginDto;

    // Permitir login por email o username
    let user = null;
    try {
      if (identifier.includes("@")) {
        user = await this.userService.findByEmail(identifier);
      } else {
        user = await this.userService.findByUsername(identifier);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException("Usuario no encontrado");
      }
      throw error;
    }

    const passwordValid = await argon2.verify(user.password, password);
    if (!passwordValid) {
      throw new UnauthorizedException("Credenciales inválidas");
    }

    const tokens = await this.generateToken(user);

    return {
      statusCode: 201,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user,
    };
  }

  /**
   * @description Actualiza el perfil de un usuario.
   * @param userId Identificador único del usuario.
   * @param updateProfileDto Datos del perfil a actualizar.
   * @returns El usuario actualizado.
   * @throws {NotFoundException} Si el usuario no existe.
   */
  async updateProfile(
    userId: string,
    updateProfileDto: UpdateProfileDto
  ): Promise<User> {
    const user = await this.userService.findOne(userId); // Asegura que existe
    return this.userService.update(userId, updateProfileDto);
  }

  /**
   * @description Cambia la contraseña de un usuario.
   * @param userId Identificador único del usuario.
   * @param changePasswordDto Datos para cambiar la contraseña.
   * @throws {UnauthorizedException} Si la contraseña actual es incorrecta.
   */
  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto
  ): Promise<void> {
    const { currentPassword, newPassword } = changePasswordDto;

    // Buscar usuario (usando UserService)
    const user = await this.userService.findOne(userId);

    // Verificar contraseña actual
    const isPasswordValid = await argon2.verify(user.password, currentPassword);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Contraseña actual incorrecta");
    }

    // Actualizar contraseña (usando UserService)
    const hashedPassword = await argon2.hash(newPassword);
    await this.userService.updatePassword(userId, hashedPassword);
  }

  /**
   * @description Genera un token de restablecimiento de contraseña y lo envía por correo electrónico.
   * @param email Correo electrónico del usuario.
   */
  async generateResetToken(email: string): Promise<void> {
    // Buscar usuario (usando UserService)
    let user: User;
    try {
      user = await this.userService.findByEmail(email);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException(`Usuario con email ${email} no encontrado`);
      }
      throw error;
    }

    const resetPasswordToken = uuidv4();
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora

    // Actualizar token (usando UserService)
    await this.userService.setResetToken(
      user.id,
      resetPasswordToken,
      resetPasswordExpires
    );

    // Enviar correo electrónico
    await this.mailService.sendResetPasswordEmail(
      user.email,
      resetPasswordToken
    );
  }

  /**
   * @description Restablece la contraseña de un usuario.
   * @param token Token de restablecimiento de contraseña.
   * @param newPassword Nueva contraseña.
   * @throws {UnauthorizedException} Si el token es inválido o ha expirado.
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Buscar usuario por token (usando UserService)
    const user = await this.userService.findByResetToken(token);

    // Verificar token y expiración
    if (!user || user.resetPasswordExpires < new Date()) {
      throw new UnauthorizedException("Token inválido o expirado");
    }

    const hashedPassword = await argon2.hash(newPassword);
    // Actualizar contraseña y limpiar token (usando UserService)
    await this.userService.updatePasswordAndClearResetToken(
      user.id,
      hashedPassword
    );
  }

  /**
   * @private
   * @description Genera un token de acceso JWT para el usuario.
   * @param user El usuario para el que se genera el token.
   * @returns Un objeto con el token de acceso.
   */
  private async generateToken(user: User) {
    const payload = {
      sub: user.id,
      email: user.email,
      roles: user.roles,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>("JWT_SECRET"),
      expiresIn: this.configService.get<string>("JWT_EXPIRATION") || "1d",
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret:
        this.configService.get<string>("JWT_REFRESH_SECRET") ||
        this.configService.get<string>("JWT_SECRET"),
      expiresIn:
        this.configService.get<string>("JWT_REFRESH_EXPIRATION") || "7d",
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * @description Decodifica un token de acceso JWT.
   * @param token El token de acceso a decodificar.
   * @returns El payload del token si se puede decodificar, o null si no se puede.
   */
  async decodeToken(token: string) {
    try {
      return this.jwtService.decode(token);
    } catch (error) {
      return null;
    }
  }

  /**
   * @description Solicita el restablecimiento de contraseña para un usuario.
   * @param requestPasswordResetDto Un objeto que contiene el correo electrónico del usuario.
   */
}
