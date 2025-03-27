import {
    BadRequestException,
    ConflictException,
    Inject,
    Injectable,
    UnauthorizedException,
    forwardRef,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { AccountService } from '../account/account.service';
import { User } from '../user/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly accountService: AccountService,
    @Inject(forwardRef(() => UserService))
    private readonly usersService: UserService,
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
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

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    
    const user = await this.userRepository.findOne({ 
      where: { email },
      select: ['id', 'email', 'password', 'role'] // Asegúrate de seleccionar los campos necesarios
    });

    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload = { 
      sub: user.id,
      email: user.email,
      role: user.role
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        role: user.role
      }
    };
  }

  async profile({ email, role }: { email: string; role: string }) {
    return await this.usersService.findOneByEmail(email);
  }

  async validateUser(id: number): Promise<any> {
    const user = await this.userRepository.findOne({ 
      where: { id },
      select: ['id', 'email', 'role']
    });
    
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    
    return user;
  }
}
