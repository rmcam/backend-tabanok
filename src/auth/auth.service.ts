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

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly userService: UserService, // <-- UserService se mantiene
    private readonly mailService: MailService // Inyectar MailService
  ) {}

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

  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User> {
    const user = await this.userService.findOne(userId); // Asegura que existe
    return this.userService.update(userId, updateProfileDto);
  }

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

  async decodeToken(token: string) {
    try {
      return this.jwtService.decode(token);
    } catch (error) {
      return null;
    }
  }

  async requestPasswordReset(requestPasswordResetDto: { email: string }): Promise<void> {
    const { email } = requestPasswordResetDto;
    await this.generateResetToken(email);
  }
}
