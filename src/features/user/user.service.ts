import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../account/entities/account.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole, UserStatus } from './entities/user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Account)
        private readonly accountRepository: Repository<Account>,
    ) { }

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

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);
        Object.assign(user, updateUserDto);
        return this.userRepository.save(user);
    }

    async remove(id: string): Promise<void> {
        const user = await this.findOne(id);
        await this.userRepository.remove(user);
    }

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