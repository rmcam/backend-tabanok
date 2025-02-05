import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { UsersService } from 'src/users/users.service';

import { JwtService } from '@nestjs/jwt';
import { AccountsService } from 'src/accounts/accounts.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountsService: AccountsService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(loginDto: RegisterDto) {
    const { email, password } = loginDto;

    const user = await this.usersService.findOneByEmail(email);
    if (user) throw new BadRequestException('User already exists');

    const newUser = await this.usersService.create(loginDto);

    if (!newUser) throw new BadRequestException('User not created');

    const newAccount = await this.accountsService.create({
      email,
      password: await bcrypt.hash(password, 10),
    });

    if (!newAccount) throw new BadRequestException('Account not created');

    return newUser;
  }

  async login({ email, password }: LoginDto) {
    const account = await this.accountsService.findByEmailWithPassword(email);
    const user = await this.usersService.findOneByEmail(account.email);

    if (!account || !user) {
      throw new UnauthorizedException();
    }
    const isPasswordValid = await bcrypt.compare(password, account.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException();
    }

    const payload = {
      email: user.email,
      role: user.role,
      name: user.firstName + ' ' + user.firstLastName,
    };

    const token = await this.jwtService.signAsync(payload);

    if (!token) {
      throw new BadRequestException('Token not created');
    }

    return {
      user: payload,
      accessToken: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async profile({ email, role }: { email: string; role: string }) {
    return await this.usersService.findOne(email);
  }
}
