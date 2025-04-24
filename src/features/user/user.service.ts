import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Account } from '../account/entities/account.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '../../auth/entities/user.entity';
import { UserRole, UserStatus } from '../../auth/enums/auth.enum';
import { UserLevel } from '../gamification/entities/user-level.entity';
import { UserLevelRepository } from '../gamification/repositories/user-level.repository';
import { Inject } from '@nestjs/common';
import { Statistics } from '../statistics/entities/statistics.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Account)
        private readonly accountRepository: Repository<Account>,
        private readonly userLevelRepository: UserLevelRepository,
        @InjectRepository(Statistics)
        private readonly statisticsRepository: Repository<Statistics>,
    ) { }

    async findByUsername(username: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { username } });
        if (!user) {
            throw new NotFoundException('Usuario no encontrado');
        }
        return user;
    }

    async findByUsernameOptional(username: string): Promise<User | null> {
        return await this.userRepository.findOne({ where: { username } });
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const user = await this.userRepository.save({
            ...createUserDto,
            role: UserRole.USER,
            status: UserStatus.ACTIVE,
            gameStats: {
                totalPoints: 0,
                level: 1,
                streak: 0,
                lastActivity: new Date()
            },
            points: 0,
            level: 1,
            languages: createUserDto.languages || [],
            preferences: {
                notifications: true,
                language: 'es',
                theme: 'light'
            },
            isEmailVerified: false,
            culturalPoints: 0
        });

        if (process.env.NODE_ENV !== 'test') {
            await this.accountRepository.save(
                this.accountRepository.create({
                    points: 0,
                    level: 1,
                    isActive: true,
                    user
                })
            );
        }

        const newUserLevel = this.userLevelRepository.repository.create({
            user,
            userId: user.id,
        });
        await this.userLevelRepository.repository.save(newUserLevel);

        return user;
    }

    async findAll(): Promise<User[]> {
        return this.userRepository.find();
    }

    async findOne(id: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
        }
        return user;
    }

    async findByEmail(email: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new NotFoundException(`Usuario con email ${email} no encontrado`);
        }
        return user;
    }

    async findByEmailOptional(email: string): Promise<User | null> {
        return await this.userRepository.findOne({ where: { email } });
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);
        Object.assign(user, updateUserDto);
        return this.userRepository.save(user);
    }

    async remove(id: string): Promise<void> {
        const user = await this.findOne(id);
        // Eliminar estadísticas asociadas al usuario
        await this.statisticsRepository.delete({ userId: id });
        await this.userRepository.remove(user);
    }

    // --- Métodos para restablecimiento de contraseña ---

    async setResetToken(userId: string, token: string | null, expires: Date | null): Promise<void> {
        await this.userRepository.update(userId, {
            resetPasswordToken: token,
            resetPasswordExpires: expires,
        });
    }

    async findByResetToken(token: string): Promise<User | null> {
        // Busca usuarios con el token que no haya expirado
        return this.userRepository.findOne({
            where: {
                resetPasswordToken: token,
                // resetPasswordExpires: MoreThan(new Date()), // TypeORM > 0.3 requires MoreThanOrEqual? Check docs if needed. For now, check expiry in AuthService
            },
        });
    }

    async updatePasswordAndClearResetToken(userId: string, hashedPassword: string): Promise<void> {
        await this.userRepository.update(userId, {
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null,
        });
    }

    async updateLastLogin(userId: string): Promise<void>
     {
        await this.userRepository.update(userId, { lastLoginAt: new Date() });
    }

    async updatePassword(userId: string, hashedPassword: string): Promise<void> {
        await this.userRepository.update(userId, { password: hashedPassword });
    }

    // --- Métodos existentes ---

    async updatePoints(userId: string, points: number): Promise<User> {
        const user = await this.findOne(userId);
        const gameStats = {
            ...user.gameStats,
            totalPoints: points
        };

        return await this.userRepository.save({
            ...user,
            points,
            gameStats
        });
    }

    async updateLevel(userId: string, level: number): Promise<User> {
        const user = await this.findOne(userId);
        const gameStats = {
            ...user.gameStats,
            level
        };

        return await this.userRepository.save({
            ...user,
            level,
            gameStats
        });
    }
}
