import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../account/entities/account.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Account)
        private readonly accountRepository: Repository<Account>,
    ) { }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const user = this.userRepository.create(createUserDto);
        const savedUser = await this.userRepository.save(user);

        // Create default account for the user only if not in test environment
        if (process.env.NODE_ENV !== 'test') {
            const account = this.accountRepository.create({
                user: savedUser,
                points: 0,
                level: 1,
            });
            await this.accountRepository.save(account);
        }

        return savedUser;
    }

    async findAll(): Promise<User[]> {
        return await this.userRepository.find({
            where: { isActive: true },
            relations: ['accounts'],
        });
    }

    async findOne(id: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id, isActive: true },
            relations: ['accounts'],
        });

        if (!user) {
            throw new NotFoundException(`User with ID ${id} not found`);
        }

        return user;
    }

    async findByEmail(email: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { email, isActive: true },
            relations: ['accounts'],
        });

        if (!user) {
            throw new NotFoundException(`User with email ${email} not found`);
        }

        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
        const user = await this.findOne(id);
        Object.assign(user, updateUserDto);
        return await this.userRepository.save(user);
    }

    async remove(id: string): Promise<void> {
        const user = await this.findOne(id);
        user.isActive = false;
        await this.userRepository.save(user);
    }

    async updatePoints(id: string, points: number): Promise<void> {
        const user = await this.findOne(id);
        const account = user.accounts[0];
        if (!account) {
            throw new NotFoundException(`Account not found for user ${id}`);
        }
        account.points = points;
        await this.accountRepository.save(account);
    }

    async updateLevel(id: string, level: number): Promise<void> {
        const user = await this.findOne(id);
        const account = user.accounts[0];
        if (!account) {
            throw new NotFoundException(`Account not found for user ${id}`);
        }
        account.level = level;
        await this.accountRepository.save(account);
    }
} 