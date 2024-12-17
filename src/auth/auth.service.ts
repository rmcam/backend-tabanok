import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcryptjs from 'bcryptjs';
import { UsersService } from 'src/users/users.service';

import { Account } from 'src/accounts/entities/account.entity';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AccountsService } from 'src/accounts/accounts.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register({ name, lastName, email, password }: RegisterDto) {
    const user = await this.usersService.findOneByEmail(email);
    if (user) throw new BadRequestException('User already exists');
    await this.usersService.create({
      name,
      lastName,
      email,
      password: await bcryptjs.hash(password, 10),
    });
    return { name, email }; //Devuelve valores al cliente
  }

  async login({ email, password }: LoginDto) {
    const user = await this.usersService.findByEmailWithPassword(email);
    if (!user) {
      throw new UnauthorizedException('Email is wrong');
    }
    const isMatch = await bcryptjs.compare(password, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Password is wrong');
    }
    const account = await this.accountsService.findOne(email);
    const payload = { email: user.email, role: user.role }; //En esta db el email es suficioente

    const token = await this.jwtService.signAsync(payload);

    return {
      token: token,
      email: user.email,
      emailVerified: account.emailVerified,
    };
  }

  async profile({ email, role }: { email: string; role: string }) {
    return await this.usersService.findOneByEmail(email);
  }
}
