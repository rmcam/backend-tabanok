import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { Account } from './entities/account.entity';

@Injectable()
export class AccountService {
    constructor(
        @InjectRepository(Account)
        private readonly accountRepository: Repository<Account>,
    ) { }

    async create(createAccountDto: CreateAccountDto): Promise<Account> {
        const account = this.accountRepository.create(createAccountDto);
        return await this.accountRepository.save(account);
    }

    async findAll(): Promise<Account[]> {
        return await this.accountRepository.find({
            where: { isActive: true },
            relations: ['user'],
        });
    }

    async findOne(id: string): Promise<Account> {
        const account = await this.accountRepository.findOne({
            where: { id, isActive: true },
            relations: ['user'],
        });

        if (!account) {
            throw new NotFoundException(`Account with ID ${id} not found`);
        }

        return account;
    }

    async update(id: string, updateAccountDto: UpdateAccountDto): Promise<Account> {
        const account = await this.findOne(id);
        Object.assign(account, updateAccountDto);
        return await this.accountRepository.save(account);
    }

    async remove(id: string): Promise<void> {
        const account = await this.findOne(id);
        account.isActive = false;
        await this.accountRepository.save(account);
    }

    async updateStreak(id: string, streak: number): Promise<Account> {
        const account = await this.findOne(id);
        account.streak = streak;
        account.lastActivity = new Date();
        return await this.accountRepository.save(account);
    }

    async updateSettings(id: string, settings: Record<string, any>): Promise<Account> {
        const account = await this.findOne(id);
        account.settings = { ...account.settings, ...settings };
        return await this.accountRepository.save(account);
    }

    async updatePreferences(id: string, preferences: Record<string, any>): Promise<Account> {
        const account = await this.findOne(id);
        account.preferences = { ...account.preferences, ...preferences };
        return await this.accountRepository.save(account);
    }
} 