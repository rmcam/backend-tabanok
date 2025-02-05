import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ActiveUser } from 'src/common/decorators/active-user.decorator';
import { UserActiveInterface } from 'src/common/interfaces/user-active.interface';
import { Role } from '../common/enums/role.enum';
import { AuthService } from './auth.service';
import { Auth } from './decorators/auth.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Response } from 'express';
@ApiBearerAuth()
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Res() res: Response) {
    try {
      const { accessToken, refreshToken, user } = await this.authService.login(loginDto);
      
      res.status(HttpStatus.OK).json({
        accessToken,
        refreshToken,
        user,
      });
    } catch (error) {
      res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Credenciales incorrectas' });
    }
  }
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }
  @ApiBearerAuth()
  @Get('profile')
  @Auth(Role.ADMIN)
  async profile(@ActiveUser() user: UserActiveInterface) {
    return this.authService.profile(user);
  }
}
