import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Account } from '../accounts/entities/account.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const user = new User();
    user.firstName = createUserDto.firstName;
    user.secondName = createUserDto.secondName;
    user.firstLastName = createUserDto.firstLastName;
    user.secondLastName = createUserDto.secondLastName;
    user.email = createUserDto.email;
    user.password = await bcrypt.hash(createUserDto.password, 10);

    // console.log(user);
    return this.userRepository.save(user);
  }

  async findOneByEmail(email: string) {
    return this.userRepository.findOneBy({ email });
  }

  async findByEmailWithPassword(email: string) {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'role'],
    });
  }

  async findAll() {
    return this.userRepository.find();
  }

  async findOne(email: string) {
    return await this.userRepository.findOne({
      where: { email: email },
    });
  }

  async updateStatusEmail(email: string, updateUserDto: UpdateUserDto) {
    const result = await this.userRepository.update(
      { email: email },
      { ...updateUserDto },
    );

    if (!result) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    return await this.userRepository.findOne({
      where: { email: email },
    });
  }

  async remove(email: string) {
    return await this.userRepository.softDelete({ email });
  }
}
