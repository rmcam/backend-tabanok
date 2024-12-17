import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAccountDto } from './dto/create-account.dto';
import { Account } from './entities/account.entity';

@Injectable()
export class AccountsService {
  constructor(
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
  ) {}
  async create(createAccountDto: CreateAccountDto) {
    return await this.accountRepository.save(createAccountDto);
  }

  async findAll() {
    return this.accountRepository.find();
  }

  async findOne(email: string) {
    return await this.accountRepository.findOne({ where: { email: email } });
  }

  async updateEmailVerified(email: string) {
    const result = await this.accountRepository.update(
      { email: email },
      { emailVerified: new Date(Date.now()) },
    );

    if (!result) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return await this.accountRepository.findOne({
      where: { email: email },
    });
  }

  async remove(id: number) {
    return `This action removes a #${id} account`;
  }
}
