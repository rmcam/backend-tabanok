import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, UserStatus } from './entities/user.entity'; // <-- Ruta corregida
import { UserService } from '../features/user/user.service';
import { MailService } from '../lib/mail.service'; // Importar MailService
import {
  ChangePasswordDto,
  LoginDto,
  RegisterDto,
  UpdateProfileDto,
} from './dto/auth.dto';

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
    private readonly mailService: MailService // Inyectar MailService
  ) {}

  /**
   * @description Registra un nuevo usuario en la aplicación.
   * @param registerDto Datos del usuario a registrar.
   * @returns Un objeto con la información del usuario y el token de acceso.
   * @throws {BadRequestException} Si el correo electrónico ya está registrado.
   */
  async register(registerDto: RegisterDto): Promise<any> {
    const { email, password } = registerDto;

    // Verificar si el usuario ya existe (usando UserService)
    try {
      await this.userService.findByEmail(email);
      // Si encuentra, lanza excepción
      throw new BadRequestException('El correo electrónico ya está registrado');
    } catch (error) {
      // Si es NotFoundException, el usuario no existe (continuar)
      if (!(error instanceof NotFoundException)) {
        throw error; // Relanzar otros errores
      }
    }

    // Crear nuevo usuario
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await this.userService.create({
      ...registerDto,
      password: hashedPassword,
    });

    // Generar token
    const token = await this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      ...token,
    };
  }

  /**
   * @description Inicia sesión un usuario en la aplicación.
   * @param loginDto Datos del usuario a iniciar sesión.
   * @returns Un objeto con la información del usuario y el token de acceso.
   * @throws {UnauthorizedException} Si las credenciales son inválidas o la cuenta no está activa.
   */
  async login(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto;

    // Buscar usuario (usando UserService)
    let user: User;
    try {
      user = await this.userService.findByEmail(email);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('Credenciales inválidas');
      }
      throw error;
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    // Verificar estado del usuario
    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Tu cuenta no está activa');
    }

    // Actualizar último login (usando UserService)
    await this.userService.updateLastLogin(user.id);

    // Generar token
    const token = await this.generateToken(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
      ...token,
    };
  }

  /**
   * @description Actualiza el perfil de un usuario.
   * @param userId Identificador único del usuario.
   * @param updateProfileDto Datos del perfil a actualizar.
   * @returns El usuario actualizado.
   * @throws {NotFoundException} Si el usuario no existe.
   */
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    const user = await this.userService.findOne(userId); // Asegura que existe
    return this.userService.update(userId, updateProfileDto);
  }

  /**
   * @description Cambia la contraseña de un usuario.
   * @param userId Identificador único del usuario.
   * @param changePasswordDto Datos para cambiar la contraseña.
   * @throws {UnauthorizedException} Si la contraseña actual es incorrecta.
   */
  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const { currentPassword, newPassword } = changePasswordDto;

    // Buscar usuario (usando UserService)
    const user = await this.userService.findOne(userId);

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Contraseña actual incorrecta');
    }

    // Actualizar contraseña (usando UserService)
    const hashedPassword = await bcrypt.hash(newPassword, 10);
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
        console.warn(`Intento de restablecimiento para email no existente: ${email}`);
        return;
      }
      throw error;
    }

    const resetPasswordToken = uuidv4();
    const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora

    // Actualizar token (usando UserService)
    await this.userService.setResetToken(user.id, resetPasswordToken, resetPasswordExpires);

    // Enviar correo electrónico
    await this.mailService.sendResetPasswordEmail(user.email, resetPasswordToken);
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
      throw new UnauthorizedException('Token inválido o expirado');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    // Actualizar contraseña y limpiar token (usando UserService)
    await this.userService.updatePasswordAndClearResetToken(user.id, hashedPassword);
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
      roles: [user.role],
    };

    return {
      access_token: this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRATION') || '1d',
      }),
    };
  }

  /**
   * @description Verifica la validez de un token de acceso JWT.
   * @param token El token de acceso a verificar.
   * @returns El payload del token si es válido, o null si no lo es.
   */
  async verifyToken(token: string) {
    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      return payload;
    } catch (error) {
      return null;
    }
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
  async requestPasswordReset(requestPasswordResetDto: { email: string }): Promise<void> {
    const { email } = requestPasswordResetDto;
    await this.generateResetToken(email);
  }
}
