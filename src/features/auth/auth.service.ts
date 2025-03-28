import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) { }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(loginDto: LoginDto) {
    const user = await this.userService.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        profile: {
          firstName: user.profile?.firstName,
          lastName: user.profile?.lastName
        },
        role: user.role,
      },
    };
  }

  async register(registerDto: RegisterDto) {
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.userService.create({
      email: registerDto.email,
      password: hashedPassword,
      profile: {
        firstName: registerDto.profile.firstName,
        lastName: registerDto.profile.lastName
      },
      username: registerDto.username
    });

    const payload = { sub: user.id, email: user.email };
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        profile: {
          firstName: user.profile?.firstName,
          lastName: user.profile?.lastName
        },
        role: user.role,
      },
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.userService.findOne(payload.sub);

      const newPayload = { sub: user.id, email: user.email };
      const accessToken = this.jwtService.sign(newPayload);
      const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d' });

      return {
        accessToken,
        refreshToken: newRefreshToken,
        user: {
          id: user.id,
          email: user.email,
          profile: {
            firstName: user.profile?.firstName,
            lastName: user.profile?.lastName
          },
          role: user.role,
        },
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
} 