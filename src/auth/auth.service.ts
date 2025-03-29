import { BadRequestException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from '../features/user/user.service';
import { ChangePasswordDto, LoginDto, RegisterDto, UpdateProfileDto } from './dto/auth.dto';
import { User, UserRole, UserStatus } from './entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private jwtService: JwtService,
        private configService: ConfigService,
        private readonly userService: UserService
    ) { }

    async register(registerDto: RegisterDto): Promise<any> {
        const { email, password } = registerDto;

        // Verificar si el usuario ya existe
        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new BadRequestException('El correo electrónico ya está registrado');
        }

        // Crear nuevo usuario
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = this.userRepository.create({
            ...registerDto,
            password: hashedPassword,
            role: registerDto.role || UserRole.USER,
            status: UserStatus.ACTIVE,
            languages: registerDto.languages || []
        });

        await this.userRepository.save(user);

        // Generar token
        const token = await this.generateToken(user);

        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            },
            ...token
        };
    }

    async login(loginDto: LoginDto): Promise<any> {
        const { email, password } = loginDto;

        // Buscar usuario
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new UnauthorizedException('Credenciales inválidas');
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

        // Actualizar último login
        user.lastLoginAt = new Date();
        await this.userRepository.save(user);

        // Generar token
        const token = await this.generateToken(user);

        return {
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role
            },
            ...token
        };
    }

    async updateProfile(userId: string, updateProfileDto: UpdateProfileDto): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // Actualizar campos
        Object.assign(user, updateProfileDto);
        return this.userRepository.save(user);
    }

    async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
        const { currentPassword, newPassword } = changePasswordDto;

        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }

        // Verificar contraseña actual
        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Contraseña actual incorrecta');
        }

        // Actualizar contraseña
        user.password = await bcrypt.hash(newPassword, 10);
        await this.userRepository.save(user);
    }

    async generateResetToken(email: string): Promise<void> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new UnauthorizedException('Usuario no encontrado');
        }

        const resetPasswordToken = uuidv4();
        const resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hora

        await this.userRepository.update(user.id, {
            resetPasswordToken,
            resetPasswordExpires
        });
    }

    async resetPassword(token: string, newPassword: string): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { resetPasswordToken: token }
        });

        if (!user || user.resetPasswordExpires < new Date()) {
            throw new UnauthorizedException('Token inválido o expirado');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.userRepository.update(user.id, {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null
        });
    }

    private async generateToken(user: User) {
        const payload = {
            sub: user.id,
            email: user.email,
            roles: [user.role]
        };

        return {
            access_token: this.jwtService.sign(payload, {
                secret: this.configService.get<string>('JWT_SECRET'),
                expiresIn: this.configService.get<string>('JWT_EXPIRATION') || '1d'
            })
        };
    }

    async verifyToken(token: string) {
        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('JWT_SECRET')
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
        // TODO: Implementar el envío del correo electrónico con el token
    }
} 