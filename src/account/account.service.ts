import { Injectable } from '@nestjs/common';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from './entities/account.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AccountService {
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
    async findOneByEmail(email: string) {
      return this.accountRepository.findOneBy({ email });
    }
    async findOne(email: string) {
      return await this.accountRepository.findOne({ where: { email } });
    }
  
    async remove(id: number) {
      return `This action removes a #${id} account`;
    }
}
