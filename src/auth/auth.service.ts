import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';

import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UserService } from 'src/user/user.service';
import { AccountService } from '../account/account.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountService: AccountService,
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signup(registerDto: RegisterDto) {
    const { email } = registerDto;
    const user = await this.usersService.findByEmailWithPassword(email);
    console.log('user', user);

    if (user) throw new ConflictException('User already exists');

    const newUser = await this.usersService.create(registerDto);

    if (!newUser) throw new BadRequestException('User not created');

    const newAccount = await this.accountService.create({ email });

    if (!newAccount) throw new BadRequestException('Account not created');

    return {
      email: newUser.email,
      name: newUser.firstName + ' ' + newUser.firstLastName,
    };
  }

  async signin(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const user = await this.usersService.findByEmailWithPassword(email);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    const token = await this.jwtService.signAsync(payload);

    if (!token) {
      throw new BadRequestException('Token not created');
    }

    return {
      user: payload,
      accessToken: token,
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }

  async profile({ email, role }: { email: string; role: string }) {
    return await this.usersService.findOneByEmail(email);
  }
}
